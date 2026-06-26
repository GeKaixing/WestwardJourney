import { Module } from "@nestjs/common";
import { GameGateway } from "./GameGateway";

@Module({
  providers: [GameGateway],
})
export class WebSocketModule {}
