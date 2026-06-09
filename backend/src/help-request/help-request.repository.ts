import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { Member } from "../member/entity/member.entity";
import { Task } from "../task/entity/task.entity";
import { HelpRequestAttachment } from "./entity/help-request-attachment.entity";
import { HelpRequest } from "./entity/help-request.entity";

@Injectable()
export class HelpRequestRepository {
  constructor(
    @InjectRepository(HelpRequest)
    private readonly helpRequestRepository: Repository<HelpRequest>,
    @InjectRepository(HelpRequestAttachment)
    private readonly helpRequestAttachmentRepository: Repository<HelpRequestAttachment>,
    @InjectRepository(Member)
    private readonly memberRepository: Repository<Member>,
    @InjectRepository(Task)
    private readonly taskRepository: Repository<Task>
  ) {}

  async findMemberById(id: number): Promise<Member | null> {
    return this.memberRepository.findOne({
      where: {
        id,
        isActive: true
      }
    });
  }

  async findTaskById(id: number): Promise<Task | null> {
    return this.taskRepository.findOne({
      where: {
        id,
        isDraft: false
      }
    });
  }

  async findReceivedByMemberId(memberId: number): Promise<HelpRequest[]> {
    return this.helpRequestRepository
      .createQueryBuilder("helpRequest")
      .leftJoinAndSelect("helpRequest.task", "task")
      .leftJoinAndSelect("helpRequest.requester", "requester")
      .leftJoinAndSelect("requester.positionInfo", "requesterPosition")
      .leftJoinAndSelect("helpRequest.attachments", "attachments")
      .where("helpRequest.receiverId = :memberId", { memberId })
      .orderBy("helpRequest.createdAt", "DESC")
      .addOrderBy("attachments.createdAt", "ASC")
      .getMany();
  }

  async save(helpRequest: HelpRequest): Promise<HelpRequest> {
    return this.helpRequestRepository.save(helpRequest);
  }

  async saveAttachments(attachments: HelpRequestAttachment[]): Promise<HelpRequestAttachment[]> {
    return this.helpRequestAttachmentRepository.save(attachments);
  }
}
