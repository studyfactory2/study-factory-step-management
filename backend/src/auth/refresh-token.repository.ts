import { Injectable } from "@nestjs/common";
import { RefreshToken } from "./entity/refresh-token.entity";

@Injectable()
export class RefreshTokenRepository {
  findByToken(_token: string): RefreshToken | null {
    return null;
  }

  save(_refreshToken: RefreshToken): RefreshToken {
    return _refreshToken;
  }

  deleteByToken(_token: string): void {
    return;
  }
}
