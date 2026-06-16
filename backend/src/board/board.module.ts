import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { JWTAuthGuard } from "../auth/guard/jwt-auth.guard";
import { UploadModule } from "../upload/upload.module";
import { BoardRepository } from "./board.repository";
import { BoardController } from "./board.controller";
import { BoardService } from "./board.service";
import { BoardComment } from "./entity/board-comment.entity";
import { BoardCategory } from "./entity/board-category.entity";
import { BoardLike } from "./entity/board-like.entity";
import { BoardPostAttachment } from "./entity/board-post-attachment.entity";
import { BoardPostCategory } from "./entity/board-post-category.entity";
import { BoardPost } from "./entity/board-post.entity";
import { BoardView } from "./entity/board-view.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([
      BoardCategory,
      BoardComment,
      BoardLike,
      BoardPost,
      BoardPostAttachment,
      BoardPostCategory,
      BoardView
    ]),
    UploadModule
  ],
  controllers: [BoardController],
  providers: [BoardService, BoardRepository, JWTAuthGuard]
})
export class BoardModule {}
