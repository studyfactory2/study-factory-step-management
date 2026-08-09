import { Injectable, UnauthorizedException } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { CurrentMember } from "../type/current-member.type";
import { JwtPayload } from "../type/jwt-payload.type";
import { MemberRepository } from "../../member/member.repository";

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(
    configService: ConfigService,
    private readonly memberRepository: MemberRepository
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("jwt.secretKey")
    });
  }

  async validate(payload: JwtPayload): Promise<CurrentMember> {
    const member = await this.memberRepository.findById(payload.userId);
    if (!member?.isActive) {
      throw new UnauthorizedException("비활성화된 계정입니다.");
    }

    return {
      memberId: payload.userId,
      name: payload.name,
      role: payload.roleType
    };
  }
}
