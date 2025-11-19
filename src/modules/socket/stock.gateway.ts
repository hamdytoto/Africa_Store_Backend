import { Types } from 'mongoose';
import { ConfigService } from "@nestjs/config";
import { JwtService } from "@nestjs/jwt";
import { OnGatewayConnection, OnGatewayDisconnect, SubscribeMessage, WebSocketGateway, WebSocketServer } from "@nestjs/websockets";
import { Server, Socket } from "socket.io";
import { UserService } from "../user/user.service";
import { UserRepository } from "src/db/repos/user.repository";
import { TokenRepository } from "src/db/repos/token.repository";
import { BadRequestException, NotFoundException, UnauthorizedException } from "@nestjs/common";

@WebSocketGateway({
    cors: {
        origin: '*',
    }
})

export class StockGateway implements OnGatewayConnection, OnGatewayDisconnect {
    constructor(
        private readonly jwtService: JwtService,
        private readonly configService: ConfigService,
        private readonly UserRepository: UserRepository,
        private readonly TokenRepository: TokenRepository

    ) { }
    @WebSocketServer() server: Server;
    socketUsers = new Map<string, Socket>(); // key >> value 

    async handleConnection(client: Socket, ...args: any[]) {
        // check token existance 
        const authheader = client.handshake.auth?.authorization;
        if (!authheader || !authheader.startsWith('Bearer ')) {
            throw new UnauthorizedException('Unauthorized');
        }
        const token = authheader.split(' ')[1];

        try {
            const payload = this.jwtService.verify(token, {
                secret: this.configService.get<string>('TOKEN_SECRET')
            });
            const user = await this.UserRepository.findOne({ filter: { _id: payload.id } });
            if (!user) {
                throw new NotFoundException('user not found');
            }
            const tokenDoc = await this.TokenRepository.findOne({ filter: { user: user._id, isValid: true, token: token } });
            if (!tokenDoc) {
                throw new BadRequestException('Invalid token');
            }
            client.data.user = user._id
        } catch (error) {
            console.log(error.message);
            throw new UnauthorizedException('Unauthorized');
        }
        this.socketUsers.set(client.data.user.toString(), client);
        console.log(`Client connected: ${client.id}, User ID: ${client.data.user}`);

    }

    handleDisconnect(client: any) {
        this.socketUsers.delete(client.data.user.toString());
        console.log(`Client disconnected: ${client.id}, User ID: ${client.data.user}`);
    }

    // notify all users with updated stock 
    // emit event -> send to all connected clients
    broadcastStockUpdate(productId: Types.ObjectId, newStock: number) {
        this.server.emit('stock-update', { productId, stock: newStock });
    }

    // listen to specific user
    @SubscribeMessage('get-data')
    handleGetData(client: Socket, data: any) {
        console.log(`Received data from user ${client.data.user}:`, data);
    }

    // private to specific socket 
    @SubscribeMessage('private-message')
    handlePrivateMessage(client: Socket, data: {
        recevierdId: string,
        message: string
    }) {
        console.log(`Received private message from user ${client.data.user}:`, data);
        const sender = client.data.user
        if (!sender) {
            return client.emit("error", { message: "sender not found" })
        }
        const recevierdSocket = this.socketUsers.get(data.recevierdId)
        if (!recevierdSocket) {
            return client.emit("error", { message: "receiver not found" })
        }
        recevierdSocket.emit("private", { sender, message: data.message })

    }

}