import { ArrowLeft2 } from "iconsax-react";
import Image from "next/image";
import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/router";
import Ellipse from "@/public/ellipse.png";
import { io } from "socket.io-client";
import { ScrollArea } from "@/components/ui/scroll-area";

interface Message {
	role: string;
	content: string;
	image?: string;
}
interface InitData {
	chat_name: string;
	photo_url: string;
	genre: string;
	_id: any;
	user_id: string;
	messages: Message[]
};

const socket = io({ path: "/api/socket" });

const Home = () => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const handleCameraClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			const reader = new FileReader();
			reader.onloadend = () => {
				setImagePrompt(reader.result as string);
			};
			reader.readAsDataURL(file);
		}
	};

	const [message, setMessage] = useState<string>("");
	const [imagePrompt, setImagePrompt] = useState<string>("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [initData, setInitData] = useState<InitData | undefined>(undefined);

	const router = useRouter();

	const [{ chatId, userId }, setIds] = useState<{
		chatId: string;
		userId: string;
	}>({ chatId: "", userId: "" });

	useEffect(() => {
		const { id: chatId, user_id: userId } = router.query as {
			id: string;
			user_id: string;
		};
		if (chatId && userId) {
			socket.emit("joinRoom", { chatId, userId });
			setIds({ chatId, userId });

			socket.on("getInitData", (data: any) => {
				setInitData(data);
				setMessages(data.messages);
			});

			socket.on("responseMessage", (msg: Message) => {
				setMessages((prevMessages) => [...prevMessages, msg]);
			});
		}
	}, [router.query]);

	const sendMessage = () => {
		const newMessage: Message = { role: "user", content: message };
		if (imagePrompt) {
			newMessage.image = imagePrompt;
			setImagePrompt("");
		}
		setMessages((prevMessages) => [...prevMessages, newMessage]);
		socket.emit("newMessage", {
			messages: [...messages, newMessage],
			chatId,
			userId,
		});
		setMessage("");
	};

	const scrollToBottom = () => {
		if (messagesEndRef.current) {
			messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
		}
	};

	useEffect(() => {
		scrollToBottom();
	}, [messages]);

	return (
		<>
			<main className="relative flex h-[100svh] w-full flex-col">
				<div className="w-full rounded-b-xl bg-peach p-5">
					<div className="flex flex-row items-center justify-around space-x-20">
						<h1 className="font-poppins text-xl">{initData?.chat_name || "Loading..."}</h1>
						{initData && <img
							src={initData.photo_url}
							width={34}
							height={34}
							alt="Ellipse"
						/>}
					</div>
				</div>

				<ScrollArea className="flex-end flex flex-1 flex-col items-baseline justify-end overflow-y-scroll p-4">
					{messages.map(({ role, content, image }, index) => (
						<div
							key={index}
							className={`my-2 rounded-l-lg rounded-t-lg p-4 ${role === "user" ? "ml-auto w-fit max-w-[80%] justify-end bg-peach text-left text-white" : "w-fit max-w-[80%] justify-start bg-white text-left text-black"}`}
						>
							{image && (
								<div className="mt-2">
									<img
										src={image}
										alt="uploaded"
										className="h-auto max-w-full rounded"
									/>
								</div>
							)}
							{content}
						</div>
					))}
				</ScrollArea>

				<div className="flex w-full items-center justify-center p-4">
					<div className="flex w-full max-w-xl items-center">
						<button
							type="button"
							className="p-2 text-gray-500 hover:text-blue-500 focus:outline-none"
							onClick={handleCameraClick}
						>
							<svg
								xmlns="http://www.w3.org/2000/svg"
								width={28}
								height={24}
								viewBox="0 0 24 24"
								fill="none"
							>
								<path
									d="M6.76 22h10.48c2.76 0 3.86-1.69 3.99-3.75l.52-8.26A3.753 3.753 0 0 0 18 6c-.61 0-1.17-.35-1.45-.89l-.72-1.45C15.37 2.75 14.17 2 13.15 2h-2.29c-1.03 0-2.23.75-2.69 1.66l-.72 1.45C7.17 5.65 6.61 6 6 6 3.83 6 2.11 7.83 2.25 9.99l.52 8.26C2.89 20.31 4 22 6.76 22ZM10.5 8h3"
									stroke="#000000"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								></path>
								<path
									d="M12 18c1.79 0 3.25-1.46 3.25-3.25S13.79 11.5 12 11.5s-3.25 1.46-3.25 3.25S10.21 18 12 18Z"
									stroke="#000000"
									strokeWidth="1.5"
									strokeLinecap="round"
									strokeLinejoin="round"
								></path>
							</svg>
						</button>
						<input
							type="file"
							accept="image/*"
							ref={fileInputRef}
							onChange={handleFileChange}
							className="hidden"
						/>
						<div className="relative mx-2 flex-grow">
							<div className="relative">
								<textarea
									rows={1}
									className="w-full rounded-md border p-3 pr-12 font-poppins text-base placeholder-black focus:outline-none"
									placeholder="Send a message..."
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											if (
												message.trim() !== "" ||
												imagePrompt
											) {
												sendMessage();
											}
										}
									}}
								/>
								{imagePrompt && (
									<div className="absolute left-0 top-1/2 -translate-y-1/2 transform">
										<img
											src={imagePrompt}
											alt="preview"
											className="mt-2 h-[40px] max-w-[200px] rounded"
										/>
									</div>
								)}
							</div>
							<button
								type="button"
								className="absolute right-3 top-1/2 -translate-y-1/2 transform text-red-500"
								onClick={() => {
									if (message.trim() !== "" || imagePrompt) {
										sendMessage();
									}
								}}
							>
								<svg
									xmlns="http://www.w3.org/2000/svg"
									width="24"
									height="24"
									viewBox="0 0 24 24"
									fill="none"
								>
									<path
										d="m18.07 8.509-8.56-4.28c-5.75-2.88-8.11-.52-5.23 5.23l.87 1.74c.25.51.25 1.1 0 1.61l-.87 1.73c-2.88 5.75-.53 8.11 5.23 5.23l8.56-4.28c3.84-1.92 3.84-5.06 0-6.98Zm-3.23 4.24h-5.4c-.41 0-.75-.34-.75-.75s.34-.75.75-.75h5.4c.41 0 .75.34.75.75s-.34.75-.75.75Z"
										fill="#C86060"
									></path>
								</svg>
							</button>
						</div>
					</div>
				</div>
			</main>
		</>
	);
};

export default Home;

