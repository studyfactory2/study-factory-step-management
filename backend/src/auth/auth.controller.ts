import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { AuthLoginRequest } from "./dto/auth-login.request";
import { AuthRefreshRequest } from "./dto/auth-refresh.request";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  async login(@Body() loginRequest: AuthLoginRequest) {
    return this.authService.login(loginRequest);
  }

  @Post("refresh")
  async refresh(@Body() refreshRequest: AuthRefreshRequest) {
    return this.authService.refresh(refreshRequest.refreshToken);
  }
}
