import { Body, Controller, Post } from "@nestjs/common";
import { AuthService } from "./auth.service";
import { LoginRequest } from "./dto/login.request";

@Controller("auth")
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post("login")
  login(@Body() loginRequest: LoginRequest) {
    return this.authService.login(loginRequest);
  }
}
