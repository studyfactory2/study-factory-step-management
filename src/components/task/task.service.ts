import { Injectable, NotFoundException } from "@nestjs/common";
import {
  Prisma,
  TaskPriority,
  TaskStatus,
  TaskUpdateType,
} from "@prisma/client";
import { PrismaService } from "../../database/prisma.service";
import { CreateTaskInput } from "../../libs/dto/task/create-task.input";
import { CreateTaskAttachmentInput } from "../../libs/dto/task/create-task-attachment.input";
import { CreateTaskUpdateInput } from "../../libs/dto/task/create-task-update.input";
import { UpdateTaskStatusInput } from "../../libs/dto/task/update-task-status.input";

@Injectable()
export class TaskService {
  constructor(private readonly prisma: PrismaService) {}

  async create(createTaskInput: CreateTaskInput) {
    return this.prisma.task.create({
      data: {
        title: createTaskInput.title,
        description: createTaskInput.description,
        status: createTaskInput.status ?? TaskStatus.REGISTERED,
        priority: createTaskInput.priority ?? TaskPriority.MEDIUM,
        dueDate: createTaskInput.dueDate,
        assigneeId: createTaskInput.assigneeId,
        createdById: createTaskInput.createdById,
        reviewerId: createTaskInput.reviewerId,
        updates: {
          create: {
            authorId: createTaskInput.createdById,
            type: TaskUpdateType.NOTE,
            content: createTaskInput.initialNote ?? "업무가 등록되었습니다.",
          },
        },
      },
      include: this.taskDetailInclude,
    });
  }

  async findAll(filters: {
    status?: TaskStatus;
    assigneeId?: string;
    priority?: TaskPriority;
  }) {
    return this.prisma.task.findMany({
      where: {
        status: filters.status,
        assigneeId: filters.assigneeId,
        priority: filters.priority,
      },
      orderBy: [{ status: "asc" }, { dueDate: "asc" }, { createdAt: "desc" }],
      include: {
        assignee: {
          select: { id: true, name: true, role: true },
        },
        createdBy: {
          select: { id: true, name: true, role: true },
        },
      },
    });
  }

  async findOne(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      include: this.taskDetailInclude,
    });

    if (!task) {
      throw new NotFoundException("업무를 찾을 수 없습니다.");
    }

    return task;
  }

  async updateStatus(id: string, updateTaskStatusInput: UpdateTaskStatusInput) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: { id: true, status: true },
    });

    if (!task) {
      throw new NotFoundException("업무를 찾을 수 없습니다.");
    }

    return this.prisma.task.update({
      where: { id },
      data: {
        status: updateTaskStatusInput.status,
        updates: {
          create: {
            authorId: updateTaskStatusInput.authorId,
            type: TaskUpdateType.STATUS_CHANGE,
            content:
              updateTaskStatusInput.note ?? "업무 상태가 변경되었습니다.",
            previousStatus: task.status,
            nextStatus: updateTaskStatusInput.status,
          },
        },
      },
      include: this.taskDetailInclude,
    });
  }

  async addFeedback(id: string, createTaskUpdateInput: CreateTaskUpdateInput) {
    await this.ensureTaskExists(id);

    return this.prisma.taskUpdate.create({
      data: {
        taskId: id,
        authorId: createTaskUpdateInput.authorId,
        type: createTaskUpdateInput.type ?? TaskUpdateType.FEEDBACK,
        content: createTaskUpdateInput.content,
        previousStatus: createTaskUpdateInput.previousStatus,
        nextStatus: createTaskUpdateInput.nextStatus,
      },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    });
  }

  async addAttachment(
    id: string,
    createTaskAttachmentInput: CreateTaskAttachmentInput,
  ) {
    await this.ensureTaskExists(id);

    return this.prisma.taskAttachment.create({
      data: {
        taskId: id,
        uploadedById: createTaskAttachmentInput.uploadedById,
        type: createTaskAttachmentInput.type,
        fileName: createTaskAttachmentInput.fileName,
        fileUrl: createTaskAttachmentInput.fileUrl,
        mimeType: createTaskAttachmentInput.mimeType,
      },
    });
  }

  private async ensureTaskExists(id: string) {
    const task = await this.prisma.task.findUnique({
      where: { id },
      select: { id: true },
    });

    if (!task) {
      throw new NotFoundException("업무를 찾을 수 없습니다.");
    }
  }

  private readonly taskDetailInclude = {
    assignee: {
      select: { id: true, name: true, role: true, department: true },
    },
    createdBy: {
      select: { id: true, name: true, role: true },
    },
    reviewer: {
      select: { id: true, name: true, role: true },
    },
    updates: {
      orderBy: { createdAt: "desc" },
      include: {
        author: {
          select: { id: true, name: true, role: true },
        },
      },
    },
    attachments: {
      orderBy: { createdAt: "desc" },
    },
  } satisfies Prisma.TaskInclude;
}
