import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { basename, extname, join } from "path";
import { UploadFile } from "./type/upload-file.type";

export type StoredUploadFile = {
  imageUrl: string;
  originalName: string;
};

const allowedMimeTypes = new Set(["image/jpeg", "image/png", "image/webp"]);

@Injectable()
export class UploadService {
  private readonly uploadDir: string;
  private readonly uploadBaseUrl: string;
  private readonly maxUploadSizeBytes: number;
  private readonly supabaseServiceRoleKey?: string;
  private readonly supabaseStorageBucket?: string;
  private readonly supabaseStorageBaseUrl?: string;
  private readonly supabaseStorageFolder: string;

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>("UPLOAD_DIR") ?? "uploads";
    this.uploadBaseUrl = this.configService.get<string>("UPLOAD_BASE_URL") ?? "http://localhost:4000/uploads";
    const maxUploadSizeMb = Number(this.configService.get<string>("MAX_UPLOAD_SIZE_MB") ?? 10);
    this.maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;
    const supabaseUrl = this.configService.get<string>("SUPABASE_URL")?.replace(/\/$/, "");
    this.supabaseServiceRoleKey = this.configService.get<string>("SUPABASE_SERVICE_ROLE_KEY");
    this.supabaseStorageBucket = this.configService.get<string>("SUPABASE_STORAGE_BUCKET");
    this.supabaseStorageBaseUrl = supabaseUrl ? `${supabaseUrl}/storage/v1` : undefined;
    this.supabaseStorageFolder = this.trimSlashes(
      this.configService.get<string>("SUPABASE_STORAGE_FOLDER") ?? "uploads"
    );
  }

  async saveImages(files: UploadFile[] = []): Promise<StoredUploadFile[]> {
    if (files.length === 0) {
      return [];
    }

    if (!this.isSupabaseStorageEnabled()) {
      await mkdir(this.uploadDir, { recursive: true });
    }

    return Promise.all(files.map((file) => this.saveImage(file)));
  }

  private async saveImage(file: UploadFile): Promise<StoredUploadFile> {
    this.validateImage(file);

    const extension = this.getExtension(file);
    const storedName = `${randomUUID()}${extension}`;

    if (this.isSupabaseStorageEnabled()) {
      return this.saveImageToSupabase(file, storedName);
    }

    const filePath = join(this.uploadDir, storedName);

    await writeFile(filePath, file.buffer);

    return {
      imageUrl: `${this.uploadBaseUrl.replace(/\/$/, "")}/${storedName}`,
      originalName: file.originalname
    };
  }

  private async saveImageToSupabase(file: UploadFile, storedName: string): Promise<StoredUploadFile> {
    if (!this.supabaseStorageBaseUrl || !this.supabaseStorageBucket || !this.supabaseServiceRoleKey) {
      throw new BadRequestException("Supabase Storage 설정이 올바르지 않습니다.");
    }

    const objectPath = [this.supabaseStorageFolder, storedName].filter(Boolean).join("/");
    const uploadUrl = `${this.supabaseStorageBaseUrl}/object/${this.supabaseStorageBucket}/${objectPath}`;
    const response = await fetch(uploadUrl, {
      body: new Blob([new Uint8Array(file.buffer)], { type: file.mimetype }),
      headers: {
        apikey: this.supabaseServiceRoleKey,
        Authorization: `Bearer ${this.supabaseServiceRoleKey}`,
        "Cache-Control": "31536000",
        "Content-Type": file.mimetype,
        "x-upsert": "false"
      },
      method: "POST"
    });

    if (!response.ok) {
      const errorMessage = await response.text();
      throw new BadRequestException(`이미지 업로드에 실패했습니다. ${errorMessage}`);
    }

    return {
      imageUrl: `${this.supabaseStorageBaseUrl}/object/public/${this.supabaseStorageBucket}/${objectPath}`,
      originalName: file.originalname
    };
  }

  private validateImage(file: UploadFile): void {
    if (!allowedMimeTypes.has(file.mimetype)) {
      throw new BadRequestException("jpg, png, webp 이미지만 첨부할 수 있습니다.");
    }

    if (file.size > this.maxUploadSizeBytes) {
      throw new BadRequestException("첨부 파일 용량이 너무 큽니다.");
    }
  }

  private getExtension(file: UploadFile): string {
    const originalExtension = extname(basename(file.originalname)).toLowerCase();

    if (originalExtension) {
      return originalExtension;
    }

    if (file.mimetype === "image/png") {
      return ".png";
    }

    if (file.mimetype === "image/webp") {
      return ".webp";
    }

    return ".jpg";
  }

  private isSupabaseStorageEnabled(): boolean {
    return Boolean(this.supabaseStorageBaseUrl && this.supabaseStorageBucket && this.supabaseServiceRoleKey);
  }

  private trimSlashes(value: string): string {
    return value.trim().replace(/^\/+|\/+$/g, "");
  }
}
