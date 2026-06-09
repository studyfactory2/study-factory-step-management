import { Injectable } from "@nestjs/common";
import { InjectRepository } from "@nestjs/typeorm";
import { Repository } from "typeorm";
import { FavoriteMember } from "./entity/favorite-member.entity";

@Injectable()
export class FavoriteMemberRepository {
  constructor(
    @InjectRepository(FavoriteMember)
    private readonly repository: Repository<FavoriteMember>
  ) {}

  async countByOwnerMemberId(ownerMemberId: number): Promise<number> {
    return this.repository.count({
      where: { ownerMemberId }
    });
  }

  async deleteByOwnerMemberIdAndMemberId(ownerMemberId: number, memberId: number): Promise<void> {
    await this.repository.delete({
      ownerMemberId,
      memberId
    });
  }

  async exists(ownerMemberId: number, memberId: number): Promise<boolean> {
    return this.repository.exists({
      where: {
        ownerMemberId,
        memberId
      }
    });
  }

  async findByOwnerMemberId(ownerMemberId: number): Promise<FavoriteMember[]> {
    return this.repository
      .createQueryBuilder("favoriteMember")
      .leftJoinAndSelect("favoriteMember.member", "member")
      .leftJoinAndSelect("member.positionInfo", "position")
      .leftJoinAndSelect("member.positionDuty", "positionDuty")
      .where("favoriteMember.ownerMemberId = :ownerMemberId", { ownerMemberId })
      .orderBy("favoriteMember.displayOrder", "ASC")
      .addOrderBy("favoriteMember.id", "ASC")
      .getMany();
  }

  async findIdsByOwnerMemberId(ownerMemberId: number): Promise<number[]> {
    const favoriteMembers = await this.repository.find({
      order: {
        displayOrder: "ASC",
        id: "ASC"
      },
      select: {
        memberId: true
      },
      where: {
        ownerMemberId
      }
    });

    return favoriteMembers.map((favoriteMember) => favoriteMember.memberId);
  }

  async save(ownerMemberId: number, memberId: number): Promise<void> {
    const displayOrder = await this.getNextDisplayOrder(ownerMemberId);

    await this.repository.save(
      this.repository.create({
        ownerMemberId,
        memberId,
        displayOrder
      })
    );
  }

  async updateDisplayOrders(ownerMemberId: number, memberIds: number[]): Promise<void> {
    await this.repository.manager.transaction(async (entityManager) => {
      await Promise.all(
        memberIds.map((memberId, index) =>
          entityManager.update(
            FavoriteMember,
            {
              memberId,
              ownerMemberId
            },
            {
              displayOrder: index + 1
            }
          )
        )
      );
    });
  }

  private async getNextDisplayOrder(ownerMemberId: number): Promise<number> {
    const row = await this.repository
      .createQueryBuilder("favoriteMember")
      .select("COALESCE(MAX(favoriteMember.displayOrder), 0)", "maxDisplayOrder")
      .where("favoriteMember.ownerMemberId = :ownerMemberId", { ownerMemberId })
      .getRawOne<{ maxDisplayOrder: string }>();

    return Number(row?.maxDisplayOrder ?? 0) + 1;
  }
}
