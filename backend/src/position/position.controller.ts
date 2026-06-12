import { Body, Controller, Delete, Get, Param, ParseIntPipe, Patch, Post, UseGuards } from "@nestjs/common";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { PositionCreateRequest } from "./dto/position-create.request";
import { PositionTreeUpdateRequest } from "./dto/position-tree-update.request";
import { PositionUpdateRequest } from "./dto/position-update.request";
import { PositionService } from "./position.service";

@Controller("positions")
export class PositionController {
  constructor(private readonly positionService: PositionService) {}

  @Get()
  async findAll() {
    return this.positionService.findAll();
  }

  @Get("tree")
  async findTree() {
    return this.positionService.findTree();
  }

  @Post()
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async createPosition(@Body() request: PositionCreateRequest) {
    return this.positionService.create(request);
  }

  @Patch("tree")
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async updatePositionTree(@Body() request: PositionTreeUpdateRequest) {
    return this.positionService.updateTree(request);
  }

  @Patch(":id")
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async updatePosition(
    @Param("id", ParseIntPipe) id: number,
    @Body() request: PositionUpdateRequest
  ) {
    return this.positionService.update(id, request);
  }

  @Delete(":id")
  @UseGuards(JWTAuthGuard, AdminOrCeoGuard)
  async deletePosition(@Param("id", ParseIntPipe) id: number) {
    await this.positionService.delete(id);
  }
}
