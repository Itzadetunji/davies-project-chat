import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as HttpServer } from "http";
import connectMongoDB from "@/lib/mongo";
import Chat from "@/models/chat";
import { imageApiRequest, messageApiRequest, requestSwapImageApiRequest } from "@/lib/api";
// import { deductBalance } from "@/libs/utils";

interface Message {
  content?: string;
  photo_url?: string;
  role: string;
}

const ioHandler = async (req: NextApiRequest, res: any) => {
  console.log("res server.io: ", res.socket.server.io);
  if (!res.socket.server.io) {
    await connectMongoDB();
    const httpServer: HttpServer = res.socket.server;
    const io = new Server(httpServer, {
      path: "/api/socket",
    });

    io.on("connection", (socket) => {
      socket.on("joinRoom", async ({ chatId, userId }) => {
        const chat = await Chat.findOne({ _id: chatId, user_id: userId });
        console.log("join chat: ", chatId, userId, chat);
        if (chat) {
          socket.join(chatId);
          io.to(chatId).emit("allMessages", chat.messages);
        }
      });

      socket.on("newMessage", async ({ messages, chatId, userId }) => {
        const responseMessage = await processMessage(messages, chatId, userId);
        if (responseMessage !== undefined) {
          socket.to(chatId).emit("responseMessage", responseMessage);
        }
      });

      socket.on("requestImage", async ({ messages, chatId, userId }) => {
        const responseImage = await processImage(messages, chatId, userId);
        socket.to(chatId).emit("responseImage", responseImage);
      });
    });

    res.socket.server.io = io;
  }
  console.log("Out");
  res.end();
};

const processMessage = async (messages: Message[], chatId: string, userId: string) => {
  const chat = await Chat.findOne({ _id: chatId, user_id: userId });
  console.log("Process message ", chatId, userId, chat);
  if (!chat) return;

  const response = await messageApiRequest(messages, chat.genre, chat.chat_name);
  const assistantMessage = { role: "assistant", content: response.result };
  // messages.push(assistantMessage);
  await Chat.updateOne({ _id: chatId, user_id: userId }, { $push: { messages: { $each: [messages[messages.length - 1], assistantMessage] } } });
  return assistantMessage;
};

const processImage = async (messages: Message[], chatId: any, userId: string) => {
  const chat = await Chat.findOne({ _id: chatId, user_id: userId });
  if (!chat) return;

  const imageUrl = await requestSwapImageApiRequest(messages[messages.length - 1].content, chat.genre, chat.photo_url);

  const assistantMessage = { role: "assistant", photo_url: imageUrl };
  await Chat.updateOne({ _id: chatId, user_id: userId }, { $push: { messages: { $each: [messages[messages.length - 1], assistantMessage] } } });
  return assistantMessage;
};

export default ioHandler;
