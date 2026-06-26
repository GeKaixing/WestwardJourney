import { Module } from "@nestjs/common";
import { AuthModule } from "./auth/AuthModule";
import { UserModule } from "./user/UserModule";
import { SaveModule } from "./save/SaveModule";
import { WebSocketModule } from "./websocket/WebSocketModule";

@Module({
  imports: [AuthModule, UserModule, SaveModule, WebSocketModule],
  controllers: [],
  providers: [],
})
export class AppModule {}
