import { Injectable } from "@nestjs/common";
import { LoginRequest } from "./dto/login.request";
import { LoginResponse } from "./dto/login.response";
import { InvalidCredentialsException } from "./exception/invalid-credentials.exception";
import { AuthRepository } from "./auth.repository";

@Injectable()
export class AuthService {
  constructor(private readonly authRepository: AuthRepository) {}

  login(loginRequest: LoginRequest): LoginResponse {
    const member = this.authRepository.findMemberForLogin(loginRequest);

    if (!member) {
      throw new InvalidCredentialsException();
    }

    return {
      accessToken: "",
      member: {
        id: member.id,
        loginId: member.loginId,
        name: member.name,
        roleType: member.roleType
      }
    };
  }
}
