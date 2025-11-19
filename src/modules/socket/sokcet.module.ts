import { JwtModule } from "@nestjs/jwt";
import { StockGateway } from "./stock.gateway";
import { Module } from "@nestjs/common";
import { UserModule } from "../user/user.module";
import { TokenRepository } from "src/db/repos/token.repository";
import { tokenModel } from "src/db/models/token.model";

@Module({
    providers: [StockGateway, TokenRepository],
    imports: [JwtModule, UserModule, tokenModel],
    exports: [StockGateway]
})
export class SocketModule { }