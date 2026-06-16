import { Logger } from "@nestjs/common";
import { ConfigService } from "@nestjs/config";
import {
  ConnectedSocket,
  OnGatewayConnection,
  WebSocketGateway,
  WebSocketServer
} from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { verify } from "jsonwebtoken";
import { JwtPayload } from "../auth/type/jwt-payload.type";
import { NotificationType } from "./enum/notification-type.enum";

export type RealtimeNotificationPayload = {
  actorId: number;
  commentPreview: string | null;
  id: number;
  taskId: number;
  type: NotificationType;
  unreadIncrement: number;
};

@WebSocketGateway({
  cors: {
    credentials: true,
    origin: (process.env.FRONTEND_ORIGIN ?? "http://localhost:3000")
      .split(",")
      .map((origin) => origin.trim())
      .filter(Boolean)
  },
  namespace: "notifications"
})
export class NotificationGateway implements OnGatewayConnection {
  @WebSocketServer()
  private readonly server: Server;

  private readonly logger = new Logger(NotificationGateway.name);

  constructor(private readonly configService: ConfigService) {}

  handleConnection(@ConnectedSocket() socket: Socket): void {
    const token = this.getToken(socket);

    if (!token) {
      socket.disconnect(true);
      return;
    }

    try {
      const payload = verify(
        token,
        this.configService.getOrThrow<string>("jwt.secretKey")
      ) as JwtPayload;

      socket.join(this.getMemberRoom(payload.userId));
    } catch (error) {
      this.logger.warn(error instanceof Error ? error.message : "Invalid notification socket token");
      socket.disconnect(true);
    }
  }

  notifyMember(memberId: number, payload: RealtimeNotificationPayload): void {
    this.server.to(this.getMemberRoom(memberId)).emit("notification:new", payload);
  }

  private getMemberRoom(memberId: number): string {
    return `member:${memberId}`;
  }

  private getToken(socket: Socket): string | null {
    const token = socket.handshake.auth?.token;

    if (typeof token === "string" && token.trim()) {
      return token;
    }

    return null;
  }
}
