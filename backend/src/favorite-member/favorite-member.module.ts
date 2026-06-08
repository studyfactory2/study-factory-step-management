import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { MemberModule } from "../member/member.module";
import { TaskModule } from "../task/task.module";
import { FavoriteMember } from "./entity/favorite-member.entity";
import { FavoriteMemberController } from "./favorite-member.controller";
import { FavoriteMemberRepository } from "./favorite-member.repository";
import { FavoriteMemberService } from "./favorite-member.service";

@Module({
  imports: [TypeOrmModule.forFeature([FavoriteMember]), MemberModule, TaskModule],
  controllers: [FavoriteMemberController],
  providers: [FavoriteMemberRepository, FavoriteMemberService],
  exports: [FavoriteMemberRepository, FavoriteMemberService]
})
export class FavoriteMemberModule {}
