import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { BoardPost } from "./entity/board-post.entity";
import { BoardPostType } from "./enum/board-post-type.enum";

type BoardPostRawRow = {
  id: number;
  title: string;
  content: string;
  oneLineComment: string | null;
  postType: BoardPostType;
  visibility: string;
  isPinned: boolean;
  authorId: number;
  authorName: string;
  authorDisplayName: string | null;
  authorPositionName: string | null;
  authorOrganizationName: string | null;
  categories: unknown;
  likeCount: string;
  commentCount: string;
  viewCount: string;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class BoardRepository {
  constructor(
    @InjectRepository(BoardPost)
    private readonly boardPostRepository: Repository<BoardPost>
  ) {}

  async findActivePosts(type?: BoardPostType): Promise<BoardPostRawRow[]> {
    const queryBuilder = this.boardPostRepository
      .createQueryBuilder("post")
      .leftJoin("post.creator", "creator")
      .leftJoin("creator.positionInfo", "position")
      .leftJoin("creator.organization", "organization")
      .leftJoin("post.postCategories", "postCategory")
      .leftJoin("postCategory.category", "category", "category.isActive = true")
      .leftJoin("post.comments", "comment", "comment.isActive = true")
      .leftJoin("post.likes", "like")
      .leftJoin("post.views", "view")
      .select("post.id", "id")
      .addSelect("post.title", "title")
      .addSelect("post.content", "content")
      .addSelect("post.oneLineComment", "oneLineComment")
      .addSelect("post.postType", "postType")
      .addSelect("post.visibility", "visibility")
      .addSelect("post.isPinned", "isPinned")
      .addSelect("creator.id", "authorId")
      .addSelect("creator.name", "authorName")
      .addSelect("creator.displayName", "authorDisplayName")
      .addSelect("position.name", "authorPositionName")
      .addSelect("organization.name", "authorOrganizationName")
      .addSelect("COUNT(DISTINCT comment.id)", "commentCount")
      .addSelect("COUNT(DISTINCT like.id)", "likeCount")
      .addSelect("COUNT(DISTINCT view.id)", "viewCount")
      .addSelect("post.createdAt", "createdAt")
      .addSelect("post.updatedAt", "updatedAt")
      .addSelect(
        `COALESCE(
          jsonb_agg(
            DISTINCT jsonb_build_object(
              'id', category.id,
              'name', category.name,
              'icon', category.icon,
              'colorClassName', category.color_class_name,
              'displayOrder', category.display_order
            )
          ) FILTER (WHERE category.id IS NOT NULL),
          '[]'::jsonb
        )`,
        "categories"
      )
      .where("post.isActive = true")
      .groupBy("post.id")
      .addGroupBy("creator.id")
      .addGroupBy("position.id")
      .addGroupBy("organization.id")
      .orderBy("post.isPinned", "DESC")
      .addOrderBy("post.createdAt", "DESC");

    if (type) {
      queryBuilder.andWhere("post.postType = :type", { type });
    }

    return queryBuilder.getRawMany<BoardPostRawRow>();
  }

  async findActivePostById(id: number): Promise<BoardPost | null> {
    return this.boardPostRepository
      .createQueryBuilder("post")
      .leftJoinAndSelect("post.creator", "creator")
      .leftJoinAndSelect("creator.positionInfo", "position")
      .leftJoinAndSelect("creator.organization", "organization")
      .leftJoinAndSelect("post.postCategories", "postCategory")
      .leftJoinAndSelect("postCategory.category", "category")
      .leftJoinAndSelect("post.attachments", "attachment")
      .leftJoinAndSelect("post.comments", "comment", "comment.isActive = true")
      .leftJoinAndSelect("comment.creator", "commentCreator")
      .leftJoinAndSelect("commentCreator.positionInfo", "commentPosition")
      .leftJoinAndSelect("commentCreator.organization", "commentOrganization")
      .leftJoinAndSelect("post.likes", "like")
      .leftJoinAndSelect("post.views", "view")
      .where("post.id = :id", { id })
      .andWhere("post.isActive = true")
      .orderBy("attachment.displayOrder", "ASC")
      .addOrderBy("comment.createdAt", "ASC")
      .getOne();
  }
}
