import { AttachmentType } from "@prisma/client";
import { IsEnum, IsOptional, IsString, Length } from "class-validator";

export class CreateTaskAttachmentInput {
  @IsString()
  uploadedById: string;

  @IsEnum(AttachmentType)
  type: AttachmentType;

  @IsString()
  @Length(1, 255)
  fileName: string;

  @IsString()
  @Length(1, 2048)
  fileUrl: string;

  @IsOptional()
  @IsString()
  @Length(0, 100)
  mimeType?: string;
}
