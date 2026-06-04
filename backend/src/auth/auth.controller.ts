import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthLoginRequest } from "./dto/auth-login.request";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() loginRequest: AuthLoginRequest) {
    return this.authService.login(loginRequest);
  }
}
