import { Injectable } from "@nestjs/common";
import { Member } from "../member/entity/member.entity";
import { LoginRequest } from "./dto/login.request";

@Injectable()
export class AuthRepository {
  findMemberForLogin(_loginRequest: LoginRequest): Member | null {
    return null;
  }
}
