import { Injectable } from "@nestjs/common";
import { Member } from "./entity/member.entity";
import { MemberNotFoundException } from "./exception/member-not-found.exception";
import { MemberRepository } from "./member.repository";

@Injectable()
export class MemberService {
  constructor(private readonly memberRepository: MemberRepository) {}

  findAll(): Member[] {
    return this.memberRepository.findAll();
  }

  findById(id: number): Member {
    const member = this.memberRepository.findById(id);

    if (!member) {
      throw new MemberNotFoundException(id);
    }

    return member;
  }
}
