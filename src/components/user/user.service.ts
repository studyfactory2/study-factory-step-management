import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from "@nestjs/common";
import { PrismaService } from "../../database/prisma.service";
import { CreateUserInput } from "../../libs/dto/user/create-user.input";
import { LoginInput } from "../../libs/dto/user/user.input";

@Injectable()
export class UserService {
  constructor(private readonly prisma: PrismaService) {}

  async login(loginInput: LoginInput) {
    const user = await this.prisma.user.findFirst({
      where: {
        loginId: loginInput.loginId,
        role: loginInput.role,
        isActive: true,
      },
      select: {
        id: true,
        loginId: true,
        name: true,
        password: true,
        role: true,
        department: true,
      },
    });

    if (!user || user.password !== loginInput.password) {
      throw new UnauthorizedException(
        "직위, 아이디 또는 비밀번호가 올바르지 않습니다.",
      );
    }

    return {
      message: "로그인에 성공했습니다.",
      user: {
        id: user.id,
        loginId: user.loginId,
        name: user.name,
        role: user.role,
        department: user.department,
      },
    };
  }

  async create(createUserInput: CreateUserInput) {
    const existingUser = await this.prisma.user.findUnique({
      where: { loginId: createUserInput.loginId },
      select: { id: true },
    });

    if (existingUser) {
      throw new ConflictException("이미 사용 중인 아이디입니다.");
    }

    return this.prisma.user.create({
      data: {
        loginId: createUserInput.loginId,
        name: createUserInput.name,
        password: createUserInput.password,
        role: createUserInput.role,
        jobTitle: createUserInput.jobTitle,
        department: createUserInput.department,
      },
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        jobTitle: true,
        department: true,
        createdAt: true,
      },
    });
  }

  async findAll() {
    return this.prisma.user.findMany({
      orderBy: [{ role: "asc" }, { name: "asc" }],
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        jobTitle: true,
        department: true,
        isActive: true,
      },
    });
  }

  async findOne(id: string) {
    const user = await this.prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        loginId: true,
        name: true,
        role: true,
        jobTitle: true,
        department: true,
        isActive: true,
        createdAt: true,
        assignedTasks: {
          select: {
            id: true,
            title: true,
            status: true,
            dueDate: true,
          },
          orderBy: { createdAt: "desc" },
        },
      },
    });

    if (!user) {
      throw new NotFoundException("사용자를 찾을 수 없습니다.");
    }

    return user;
  }
}
