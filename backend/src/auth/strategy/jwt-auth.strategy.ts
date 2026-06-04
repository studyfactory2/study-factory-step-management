import { Injectable } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import { PassportStrategy } from "@nestjs/passport";
import { ExtractJwt, Strategy } from "passport-jwt";
import { CurrentMember } from "../type/current-member.type";
import { JwtPayload } from "../type/jwt-payload.type";

@Injectable()
export class JwtAuthStrategy extends PassportStrategy(Strategy, "jwt") {
  constructor(configService: ConfigService) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.getOrThrow<string>("jwt.secretKey")
    });
  }

  validate(payload: JwtPayload): CurrentMember {
    return {
      memberId: payload.userId,
      name: payload.name,
      role: payload.roleType
    };
  }
}
