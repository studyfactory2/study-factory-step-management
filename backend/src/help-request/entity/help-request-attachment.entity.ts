import { Column, Entity, JoinColumn, ManyToOne } from "typeorm";
import { BaseEntity } from "../../common/entity/base.entity";
import { HelpRequest } from "./help-request.entity";

@Entity({ name: "help_request_attachments" })
export class HelpRequestAttachment extends BaseEntity {
  @Column({ name: "help_request_id" })
  helpRequestId: number;

  @ManyToOne(() => HelpRequest, (helpRequest) => helpRequest.attachments, { onDelete: "CASCADE" })
  @JoinColumn({ name: "help_request_id" })
  helpRequest: HelpRequest;

  @Column({ name: "image_url" })
  imageUrl: string;

  @Column({ name: "original_name", type: "varchar", nullable: true })
  originalName: string | null;
}
