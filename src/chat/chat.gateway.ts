import {
    SubscribeMessage,
    WebSocketGateway,
    WebSocketServer,
    MessageBody,
    ConnectedSocket,
  } from "@nestjs/websockets";
  import { Server, Socket } from "socket.io";
  import { RedisService } from "../redis/redis.service";
  
  @WebSocketGateway({ cors: true }) // Cho phép CORS
  export class ChatGateway {
    @WebSocketServer() server: Server;
  
    constructor(private readonly redisService: RedisService) {}
  
    // Client tham gia phòng chat
    @SubscribeMessage("joinRoom")
    async handleJoinRoom(@MessageBody() room: string, @ConnectedSocket() client: Socket) {
      client.join(room);

      // Tải lịch sử tin nhắn từ Redis khi user vào phòng
        const messages = await this.redisService.get(room);
        console.log(messages,'ductmm_histor');
        
        client.emit("chatHistory", messages);
      console.log(`User joined room: ${room}`);
    }
  
    @SubscribeMessage("sendMessage")
    async handleMessage(@MessageBody() data: { room: string; message: string; sender: string }) {
    const { room, message, sender } = data;

    // Lấy lịch sử tin nhắn cũ từ Redis
    const chatHistory = (await this.redisService.get<{ sender: string; message: string }[]>(room)) || [];

    console.log(chatHistory);
    

    // Thêm tin nhắn mới vào lịch sử
    chatHistory.push({ sender, message });

    // Cập nhật lại dữ liệu trong Redis
    await this.redisService.set(room, chatHistory);

  // Phát tin nhắn đến các client trong phòng
    this.server.to(room).emit("receiveMessage", chatHistory);
    }
  }
  