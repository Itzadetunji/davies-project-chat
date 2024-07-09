import { Server } from "socket.io";
import type { NextApiRequest, NextApiResponse } from "next";
import { Server as HttpServer } from "http";
import connectMongoDB from "@/lib/mongo";
import Chat from "@/models/chat";
import { messageApiRequest, requestSwapImageApiRequest } from "@/lib/api";
import { detectLanguage, translateText } from "@/lib/translate";
import { deductBalance } from "@/lib/backend-utils";

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
					const has_funds = await deductBalance(1, userId);
					if (!has_funds) {
						callback({
							role: "assistant",
							content:
								"You don't have enough credits to continue this chat",
						});
						return;
					}
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
					const has_funds = await deductBalance(5, userId);
					if (!has_funds) {
						callback({
							role: "assistant",
							content:
								"You don't have enough credits to request an image",
						});
						return;
					}
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

	const lang = chat.lang || "en";
	const assistantMessage = {
		role: "assistant",
		content:
			lang !== "en"
				? await translateText(response.result, lang)
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
	
	const lang = await detectLanguage(message.content);
	const imageUrl = await requestSwapImageApiRequest(
		lang === "en"
			? message.content
			: await translateText(message.content, "en"),
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
