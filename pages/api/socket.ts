import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as HttpServer } from "http";
import connectMongoDB from "@/lib/mongo";
import Chat from "@/models/chat";
import {
	imageApiRequest,
	messageApiRequest,
	requestSwapImageApiRequest,
} from "@/lib/api";
// import { deductBalance } from "@/libs/utils";

interface Message {
	content?: string;
	photo_url?: string;
	role: string;
}

const ioHandler = async (req: NextApiRequest, res: any) => {
	if (!res.socket.server.io) {
		await connectMongoDB();
		const httpServer: HttpServer = res.socket.server;
		const io = new Server(httpServer, {
			path: "/api/socket",
			addTrailingSlash: false,
		});
		console.log("Initialized socket.io");
		io.engine.on("connection_error", (err) => {
			// console.log(err.message);  // the error message, for example "Session ID unknown"
		});

		io.on("connection", (socket) => {
			socket.on("joinRoom", async ({ chatId, userId }, callback) => {
				console.log("Received join room request", chatId);
				const chat = await Chat.findOne({
					_id: chatId,
					user_id: userId,
				});
				if (chat) {
					socket.join(chatId);
					console.log("Joined room", chatId);
					io.to(chatId).emit("getInitData", chat);
					console.log("Sent init data", chatId);
					callback(chat);
				}
			});

			socket.on(
				"newMessage",
				async ({ messages, chatId, userId }, callback) => {
					const responseMessage = await processMessage(
						messages,
						chatId,
						userId
					);
					if (responseMessage !== undefined) {
						callback(responseMessage);
					}
				}
			);

			socket.on(
				"requestImage",
				async ({ message, chatId, userId }, callback) => {
					console.log("Recieved");
					const responseImage = await processImage(
						message,
						chatId,
						userId
					);
					callback(responseImage);
				}
			);
		});

		res.socket.server.io = io;
	}
	res.end();
};

const processMessage = async (
	messages: Message[],
	chatId: string,
	userId: string
) => {
	const chat = await Chat.findOne({ _id: chatId, user_id: userId });
	if (!chat) return;

	const response = await messageApiRequest(
		messages,
		chat.genre,
		chat.chat_name
	);
	const assistantMessage = { role: "assistant", content: response.result };

	await Chat.updateOne(
		{ _id: chatId, user_id: userId },
		{
			$push: {
				messages: {
					$each: [messages[messages.length - 1], assistantMessage],
				},
			},
		}
	);
	return assistantMessage;
};

const processImage = async (message: Message, chatId: any, userId: string) => {
	const chat = await Chat.findOne({ _id: chatId, user_id: userId });
	if (!chat) return;

	const imageUrl = await requestSwapImageApiRequest(
		message.content,
		chat.genre,
		chat.photo_url
	);

	const assistantMessage = {
		role: "assistant",
		photo_url: imageUrl,
		content: `A photo response for prompt: "${message.content}"`,
	};
	await Chat.updateOne(
		{ _id: chatId, user_id: userId },
		{ $push: { messages: { $each: [message, assistantMessage] } } }
	);
	return assistantMessage;
};

export default ioHandler;
