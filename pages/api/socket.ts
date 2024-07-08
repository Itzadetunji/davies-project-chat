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
import { detectLanguage, translateText } from "@/lib/translate";
import { franc } from "franc";
import { languageMap } from "@/lib/vars";

// import { deductBalance } from "@/libs/utils";

interface Message {
	content: string;
	photo_url?: string;
	role: string;
}

const ioHandler = async (req: NextApiRequest, res: any) => {
	if (!res.socket.server.io) {
		await connectMongoDB();
		const httpServer: HttpServer = res.socket.server;
		const io = new Server(httpServer, {
			path: "/api/socket",
		});

		io.on("connection", (socket) => {
			socket.on("joinRoom", async ({ chatId, userId }) => {
				const chat = await Chat.findOne({
					_id: chatId,
					user_id: userId,
				});
				if (chat) {
					socket.join(chatId);
					io.to(chatId).emit("getInitData", chat);
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

	let code = franc(messages[messages.length - 1].content);
	if (code !== "eng") {
		code = await detectLanguage(messages[messages.length - 1].content)
	}
	const messagesCopy = JSON.parse(JSON.stringify(messages));
	messagesCopy[messagesCopy.length - 1].content +=
		code !== "eng" ? `\nThis is ${languageMap[code]} but answer in English` : "";

	const response = await messageApiRequest(
		messagesCopy,
		chat.genre,
		chat.chat_name
	);
	const assistantMessage = {
		role: "assistant",
		content:
			code !== "eng"
				? await translateText(response.result, code)
				: response.result,
	};

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
		content:
			imageUrl == null
				? "Something went wrong"
				: `Here is a photo for your request "${message.content}"`,
	};
	await Chat.updateOne(
		{ _id: chatId, user_id: userId },
		{ $push: { messages: { $each: [message, assistantMessage] } } }
	);
	return assistantMessage;
};

export default ioHandler;
