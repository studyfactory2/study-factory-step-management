import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { AdminOrCeoGuard } from "../admin/guard/admin-or-ceo.guard";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { Member } from "../member/entity/member.entity";
import { PositionDuty } from "./entity/position-duty.entity";
import { Position } from "./entity/position.entity";
import { PositionController } from "./position.controller";
import { PositionRepository } from "./position.repository";
import { PositionService } from "./position.service";

@Module({
  imports: [TypeOrmModule.forFeature([Position, PositionDuty, Member])],
  controllers: [PositionController],
  providers: [PositionService, PositionRepository, JWTAuthGuard, AdminOrCeoGuard],
  exports: [PositionService, PositionRepository]
})
export class PositionModule {}
