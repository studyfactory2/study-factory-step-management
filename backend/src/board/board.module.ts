import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { BoardRepository } from "./board.repository";
import { BoardController } from "./board.controller";
import { BoardService } from "./board.service";
import { BoardPost } from "./entity/board-post.entity";

@Module({
  imports: [TypeOrmModule.forFeature([BoardPost])],
  controllers: [BoardController],
  providers: [BoardService, BoardRepository, JWTAuthGuard]
})
export class BoardModule {}
