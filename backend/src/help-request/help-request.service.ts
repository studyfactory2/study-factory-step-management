import { BadRequestException, ForbiddenException, Injectable, NotFoundException } from "@nestjs/common";
import { CurrentMember } from "../auth/type/current-member.type";
import { Member } from "../member/entity/member.entity";
import { Task } from "../task/entity/task.entity";
import { UploadFile } from "../upload/type/upload-file.type";
import { UploadService } from "../upload/upload.service";
import { HelpRequestCreateRequest } from "./dto/help-request-create.request";
import { HelpRequestReceivedResponse } from "./dto/help-request-received.response";
import { HelpRequestAttachment } from "./entity/help-request-attachment.entity";
import { HelpRequest } from "./entity/help-request.entity";
import { HelpRequestRepository } from "./help-request.repository";

@Injectable()
export class HelpRequestService {
  constructor(
    private readonly helpRequestRepository: HelpRequestRepository,
    private readonly uploadService: UploadService
  ) {}

  async create(
    request: HelpRequestCreateRequest,
    currentMember: CurrentMember,
    files: UploadFile[] = []
  ): Promise<HelpRequestReceivedResponse> {
    const task = await this.findTask(request.taskId);
    this.validateOwnTask(task, currentMember.memberId);

    const receiver = await this.findReceiver(request.receiverId);
    this.validateReceiver(receiver, currentMember.memberId);

    const savedHelpRequest = await this.helpRequestRepository.save(request.toEntity(currentMember.memberId));
    const attachments = await this.createAttachments(savedHelpRequest.id, files);
    savedHelpRequest.task = task;
    savedHelpRequest.attachments = attachments;
    savedHelpRequest.requester = receiver.id === currentMember.memberId
      ? receiver
      : this.createCurrentMemberEntity(currentMember);

    return this.toReceivedResponse(savedHelpRequest);
  }

  async findReceived(currentMember: CurrentMember): Promise<HelpRequestReceivedResponse[]> {
    const helpRequests = await this.helpRequestRepository.findReceivedByMemberId(currentMember.memberId);
    return helpRequests.map((helpRequest) => this.toReceivedResponse(helpRequest));
  }

  private async findTask(taskId: number): Promise<Task> {
    const task = await this.helpRequestRepository.findTaskById(taskId);

    if (!task) {
      throw new NotFoundException("업무를 찾을 수 없습니다.");
    }

    return task;
  }

  private async findReceiver(receiverId: number): Promise<Member> {
    const receiver = await this.helpRequestRepository.findMemberById(receiverId);

    if (!receiver) {
      throw new NotFoundException("도움을 요청할 사원을 찾을 수 없습니다.");
    }

    return receiver;
  }

  private validateOwnTask(task: Task, memberId: number): void {
    if (task.assigneeId !== memberId && task.createdBy !== memberId) {
      throw new ForbiddenException("내 업무에만 도움을 요청할 수 있습니다.");
    }
  }

  private validateReceiver(receiver: Member, requesterId: number): void {
    if (receiver.id === requesterId) {
      throw new BadRequestException("본인에게는 도움을 요청할 수 없습니다.");
    }
  }

  private createCurrentMemberEntity(currentMember: CurrentMember): Member {
    const member = new Member();
    member.id = currentMember.memberId;
    member.name = currentMember.name;
    member.displayName = currentMember.name;
    member.roleType = currentMember.role;
    member.positionInfo = null;

    return member;
  }

  private async createAttachments(
    helpRequestId: number,
    files: UploadFile[]
  ): Promise<HelpRequestAttachment[]> {
    const uploadedFiles = await this.uploadService.saveImages(files);

    if (uploadedFiles.length === 0) {
      return [];
    }

    const attachments = uploadedFiles.map((uploadedFile) => {
      const attachment = new HelpRequestAttachment();
      attachment.helpRequestId = helpRequestId;
      attachment.imageUrl = uploadedFile.imageUrl;
      attachment.originalName = uploadedFile.originalName;

      return attachment;
    });

    return this.helpRequestRepository.saveAttachments(attachments);
  }

  private toReceivedResponse(helpRequest: HelpRequest): HelpRequestReceivedResponse {
    return {
      id: helpRequest.id,
      requesterId: helpRequest.requesterId,
      requesterName: this.getDisplayName(helpRequest.requester),
      requesterRoleType: helpRequest.requester.roleType,
      requesterPositionName: helpRequest.requester.positionInfo?.name ?? null,
      taskId: helpRequest.taskId,
      taskTitle: helpRequest.task.title,
      taskStatus: helpRequest.task.status,
      oneLineComment: helpRequest.content,
      attachments: (helpRequest.attachments ?? []).map((attachment) => ({
        id: attachment.id,
        imageUrl: attachment.imageUrl,
        originalName: attachment.originalName,
        createdAt: attachment.createdAt
      })),
      requestedAt: helpRequest.createdAt
    };
  }

  private getDisplayName(member: Member): string {
    return member.displayName ?? member.name;
  }
}
