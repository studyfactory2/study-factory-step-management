import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { In, Repository } from "typeorm";
import { BoardCategory } from "./entity/board-category.entity";
import { BoardComment } from "./entity/board-comment.entity";
import { BoardLike } from "./entity/board-like.entity";
import { BoardPost } from "./entity/board-post.entity";
import { BoardPostAttachment } from "./entity/board-post-attachment.entity";
import { BoardPostCategory } from "./entity/board-post-category.entity";
import { BoardPostDraft } from "./entity/board-post-draft.entity";
import { BoardPostDraftAttachment } from "./entity/board-post-draft-attachment.entity";
import { BoardPostDraftCategory } from "./entity/board-post-draft-category.entity";
import { BoardView } from "./entity/board-view.entity";
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
  likedByMe: boolean;
  createdAt: Date;
  updatedAt: Date;
};

@Injectable()
export class BoardRepository {
  constructor(
    @InjectRepository(BoardCategory)
    private readonly boardCategoryRepository: Repository<BoardCategory>,
    @InjectRepository(BoardComment)
    private readonly boardCommentRepository: Repository<BoardComment>,
    @InjectRepository(BoardPost)
    private readonly boardPostRepository: Repository<BoardPost>,
    @InjectRepository(BoardPostAttachment)
    private readonly boardPostAttachmentRepository: Repository<BoardPostAttachment>,
    @InjectRepository(BoardPostCategory)
    private readonly boardPostCategoryRepository: Repository<BoardPostCategory>,
    @InjectRepository(BoardPostDraft)
    private readonly boardPostDraftRepository: Repository<BoardPostDraft>,
    @InjectRepository(BoardPostDraftAttachment)
    private readonly boardPostDraftAttachmentRepository: Repository<BoardPostDraftAttachment>,
    @InjectRepository(BoardPostDraftCategory)
    private readonly boardPostDraftCategoryRepository: Repository<BoardPostDraftCategory>,
    @InjectRepository(BoardLike)
    private readonly boardLikeRepository: Repository<BoardLike>,
    @InjectRepository(BoardView)
    private readonly boardViewRepository: Repository<BoardView>
  ) {}

  async findActivePosts(viewerId: number, type?: BoardPostType): Promise<BoardPostRawRow[]> {
    const queryBuilder = this.boardPostRepository
      .createQueryBuilder("post")
      .leftJoin("post.creator", "creator")
      .leftJoin("creator.positionInfo", "position")
      .leftJoin("creator.organization", "organization")
      .leftJoin("post.postCategories", "postCategory")
      .leftJoin("postCategory.category", "category", "category.isActive = true")
      .leftJoin("post.comments", "comment", "comment.isActive = true")
      .leftJoin("post.likes", "like")
      .leftJoin("post.likes", "viewerLike", "viewerLike.memberId = :viewerId", { viewerId })
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
      .addSelect("COUNT(DISTINCT viewerLike.id) > 0", "likedByMe")
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

  async findActiveCategories(): Promise<BoardCategory[]> {
    return this.boardCategoryRepository.find({
      where: {
        isActive: true
      },
      order: {
        displayOrder: "ASC",
        id: "ASC"
      }
    });
  }

  async findActiveCategoriesByIds(ids: number[]): Promise<BoardCategory[]> {
    if (ids.length === 0) {
      return [];
    }

    return this.boardCategoryRepository
      .createQueryBuilder("category")
      .where("category.isActive = true")
      .andWhere("category.id IN (:...ids)", { ids })
      .orderBy("category.displayOrder", "ASC")
      .addOrderBy("category.id", "ASC")
      .getMany();
  }

  async savePost(post: BoardPost): Promise<BoardPost> {
    return this.boardPostRepository.save(post);
  }

  async saveDraft(draft: BoardPostDraft): Promise<BoardPostDraft> {
    return this.boardPostDraftRepository.save(draft);
  }

  async saveDraftCategories(draftCategories: BoardPostDraftCategory[]): Promise<void> {
    if (draftCategories.length === 0) {
      return;
    }

    await this.boardPostDraftCategoryRepository.save(draftCategories);
  }

  async saveDraftAttachments(attachments: BoardPostDraftAttachment[]): Promise<void> {
    if (attachments.length === 0) {
      return;
    }

    await this.boardPostDraftAttachmentRepository.save(attachments);
  }

  async deleteDraftCategoriesByDraftId(draftId: number): Promise<void> {
    await this.boardPostDraftCategoryRepository.delete({ draftId });
  }

  async deleteDraftAttachmentsExcept(draftId: number, keepAttachmentIds: number[]): Promise<void> {
    const queryBuilder = this.boardPostDraftAttachmentRepository
      .createQueryBuilder()
      .delete()
      .from(BoardPostDraftAttachment)
      .where("draft_id = :draftId", { draftId });

    if (keepAttachmentIds.length > 0) {
      queryBuilder.andWhere("id NOT IN (:...keepAttachmentIds)", { keepAttachmentIds });
    }

    await queryBuilder.execute();
  }

  async deleteDraftById(id: number, creatorId: number): Promise<void> {
    await this.boardPostDraftRepository.delete({
      id,
      createdBy: creatorId
    });
  }

  async findLatestDraftByCreator(creatorId: number): Promise<BoardPostDraft | null> {
    return this.boardPostDraftRepository
      .createQueryBuilder("draft")
      .leftJoinAndSelect("draft.draftCategories", "draftCategory")
      .leftJoinAndSelect("draftCategory.category", "category")
      .leftJoinAndSelect("draft.attachments", "attachment")
      .where("draft.createdBy = :creatorId", { creatorId })
      .orderBy("draft.updatedAt", "DESC")
      .addOrderBy("attachment.displayOrder", "ASC")
      .getOne();
  }

  async findDraftById(id: number, creatorId: number): Promise<BoardPostDraft | null> {
    return this.boardPostDraftRepository
      .createQueryBuilder("draft")
      .leftJoinAndSelect("draft.draftCategories", "draftCategory")
      .leftJoinAndSelect("draftCategory.category", "category")
      .leftJoinAndSelect("draft.attachments", "attachment")
      .where("draft.id = :id", { id })
      .andWhere("draft.createdBy = :creatorId", { creatorId })
      .orderBy("attachment.displayOrder", "ASC")
      .getOne();
  }

  async findDraftAttachmentsByIds(draftId: number, attachmentIds: number[]): Promise<BoardPostDraftAttachment[]> {
    if (attachmentIds.length === 0) {
      return [];
    }

    return this.boardPostDraftAttachmentRepository.find({
      where: {
        draftId,
        id: In(attachmentIds)
      },
      order: {
        displayOrder: "ASC",
        id: "ASC"
      }
    });
  }

  async savePostCategories(postCategories: BoardPostCategory[]): Promise<void> {
    if (postCategories.length === 0) {
      return;
    }

    await this.boardPostCategoryRepository.save(postCategories);
  }

  async saveAttachments(attachments: BoardPostAttachment[]): Promise<void> {
    if (attachments.length === 0) {
      return;
    }

    await this.boardPostAttachmentRepository.save(attachments);
  }

  async saveComment(comment: BoardComment): Promise<BoardComment> {
    return this.boardCommentRepository.save(comment);
  }

  async findActiveCommentById(id: number): Promise<BoardComment | null> {
    return this.boardCommentRepository
      .createQueryBuilder("comment")
      .leftJoinAndSelect("comment.creator", "creator")
      .leftJoinAndSelect("creator.positionInfo", "position")
      .leftJoinAndSelect("creator.organization", "organization")
      .where("comment.id = :id", { id })
      .andWhere("comment.isActive = true")
      .getOne();
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

  async findLike(postId: number, memberId: number): Promise<BoardLike | null> {
    return this.boardLikeRepository.findOne({
      where: {
        postId,
        memberId
      }
    });
  }

  async createLike(postId: number, memberId: number): Promise<void> {
    await this.boardLikeRepository.save(
      this.boardLikeRepository.create({
        postId,
        memberId
      })
    );
  }

  async deleteLike(like: BoardLike): Promise<void> {
    await this.boardLikeRepository.remove(like);
  }

  async countLikes(postId: number): Promise<number> {
    return this.boardLikeRepository.count({
      where: {
        postId
      }
    });
  }

  async createViewIfNotRecent(postId: number, memberId: number, viewedAfter: Date): Promise<void> {
    await this.boardViewRepository.manager.transaction(async (manager) => {
      await manager.query("SELECT pg_advisory_xact_lock($1, $2)", [postId, memberId]);

      const viewCount = await manager
        .getRepository(BoardView)
        .createQueryBuilder("view")
        .where("view.postId = :postId", { postId })
        .andWhere("view.memberId = :memberId", { memberId })
        .andWhere("view.lastViewedAt >= :viewedAfter", { viewedAfter })
        .getCount();

      if (viewCount > 0) {
        return;
      }

      await manager.getRepository(BoardView).save(
        manager.getRepository(BoardView).create({
          postId,
          memberId,
          lastViewedAt: new Date()
        })
      );
    });
  }
}
