import { Body, Controller, Get, Param, Post } from "@nestjs/common";
import { LoginInput } from "../../libs/dto/user/user.input";
import { CreateUserInput } from "../../libs/dto/user/create-user.input";
import { UserService } from "./user.service";

@Controller("users")
export class UserController {
  constructor(private readonly userService: UserService) {}

  @Post("login")
  login(@Body() loginInput: LoginInput) {
    return this.userService.login(loginInput);
  }

  @Post()
  create(@Body() createUserInput: CreateUserInput) {
    return this.userService.create(createUserInput);
  }

  @Get()
  findAll() {
    return this.userService.findAll();
  }

  @Get(":id")
  findOne(@Param("id") id: string) {
    return this.userService.findOne(id);
  }
}
