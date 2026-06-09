import { BadRequestException, Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { randomUUID } from "crypto";
import { mkdir, writeFile } from "fs/promises";
import { extname, join } from "path";
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

  constructor(private readonly configService: ConfigService) {
    this.uploadDir = this.configService.get<string>("UPLOAD_DIR") ?? "uploads";
    this.uploadBaseUrl = this.configService.get<string>("UPLOAD_BASE_URL") ?? "http://localhost:4000/uploads";
    const maxUploadSizeMb = Number(this.configService.get<string>("MAX_UPLOAD_SIZE_MB") ?? 10);
    this.maxUploadSizeBytes = maxUploadSizeMb * 1024 * 1024;
  }

  async saveImages(files: UploadFile[] = []): Promise<StoredUploadFile[]> {
    if (files.length === 0) {
      return [];
    }

    await mkdir(this.uploadDir, { recursive: true });

    return Promise.all(files.map((file) => this.saveImage(file)));
  }

  private async saveImage(file: UploadFile): Promise<StoredUploadFile> {
    this.validateImage(file);

    const extension = this.getExtension(file);
    const storedName = `${randomUUID()}${extension}`;
    const filePath = join(this.uploadDir, storedName);

    await writeFile(filePath, file.buffer);

    return {
      imageUrl: `${this.uploadBaseUrl.replace(/\/$/, "")}/${storedName}`,
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
    const originalExtension = extname(file.originalname).toLowerCase();

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
}
