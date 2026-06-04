import { Injectable } from "@nestjs/common";
import { Member } from "./entity/member.entity";

@Injectable()
export class MemberRepository {
  findAll(): Member[] {
    return [];
  }

  findById(_id: number): Member | null {
    return null;
  }
}
