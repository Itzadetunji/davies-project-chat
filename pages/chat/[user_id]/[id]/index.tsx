// import { ArrowLeft2 } from "iconsax-react";
// import Image from "next/image";
import { useEffect, useState, useRef, ChangeEvent } from "react";
import { useRouter } from "next/router";
// import Ellipse from "@/public/ellipse.png";
import { io } from "socket.io-client";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useUserStore } from "@/store/useUserStore";
import Link from "next/link";
import { ThreeDots } from "react-loader-spinner";
import { Button } from "@/components/ui/button";

interface Message {
	role: string;
	content: string;
	photo_url?: string;
}
interface InitData {
	chat_name: string;
	photo_url: string;
	genre: string;
	_id: any;
	user_id: string;
	messages: Message[];
}

const socket = io({ path: "/api/socket" });

const Home = () => {
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const [message, setMessage] = useState<string>("");
	const [imagePrompt, setImagePrompt] = useState<string>("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [initData, setInitData] = useState<InitData | undefined>(undefined);
	const [isLoading, setIsLoading] = useState<boolean>(false);

	const router = useRouter();

	const [{ chatId, userId }, setIds] = useState<{
		chatId: string;
		userId: string;
	}>({ chatId: "", userId: "" });

	const { setPhotoUrl, setChatName } = useUserStore();
		
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
				setChatName(data.chat_name);
				setPhotoUrl(data.photo_url);
			});
		}
	}, [router.query]);

	const [color, setColor] = useState("");

	function getRandomColor() {
		const letters = '0123456789ABCDEF';
		let color = '#';
		for (let i = 0; i < 6; i++) {
		  color += letters[Math.floor(Math.random() * 16)];
		}
		return color;
	  }
	  

	useEffect(() => {
		const randomColor = getRandomColor();
		setColor(randomColor);
	}, []);

	const sendMessage = () => {
		const newMessage: Message = { role: "user", content: message };
		setIsLoading(true);

		setMessages((prevMessages) => [...prevMessages, newMessage]);
		socket.emit(
			"newMessage",
			{
				messages: [...messages, newMessage],
				chatId,
				userId,
			},
			(response: any) => {
				setMessages((prevMessages) => [...prevMessages, response]);
				setIsLoading(false);
			}
		);
		setMessage("");
	};

	const requestImage = () => {
		const newMessage: Message = { role: "user", content: message };
		setIsLoading(true);
		setMessages((prevMessages) => [...prevMessages, newMessage]);
		socket.emit(
			"requestImage",
			{
				message: newMessage,
				chatId,
				userId,
			},
			(response: any) => {
				setMessages((prevMessages) => [...prevMessages, response]);
				setIsLoading(false);
			}
		);
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
				<div
					className="w-full rounded-b-xl p-2"
					style={{ backgroundColor: color }}
				>
					<div className="flex items-center justify-between">
						<h1 className="px-2 font-poppins text-xl text-white">
							{initData?.chat_name || "Loading..."}
						</h1>
						{initData && (
							<Link href={"/profile"}>
								<img
									src={initData.photo_url}
									alt="Ellipse"
									className="m-1 h-12 w-12 cursor-pointer rounded-full"
								/>
							</Link>
						)}
					</div>
				</div>

				<ScrollArea className="flex-end flex flex-1 flex-col items-baseline justify-end overflow-y-scroll p-4">
					{messages.map(({ role, content, photo_url }, index) => (
						<div
							key={index}
							className={`my-2 rounded-l-lg rounded-t-lg p-4 ${role === "user" ? "ml-auto w-fit max-w-[80%] justify-end text-left text-white" : "w-fit max-w-[80%] justify-start text-left text-black"}`}
							style={{
								backgroundColor:
									role === "user" ? color : "white",
							}}
						>
							{photo_url && (
								<div className="mt-2">
									<img
										src={photo_url}
										alt="uploaded"
										className="rounded object-contain"
										width={480}
									/>
								</div>
							)}
							{photo_url === undefined && content}

						</div>
					))}
					{isLoading && (
						<ThreeDots width={34} height={24} color="black" />
					)}

					<div ref={messagesEndRef} />
				</ScrollArea>

				<div className="flex w-full items-center justify-center px-4">
					<div className="flex w-full items-center">
						<div className="relative flex-grow">
							<div className="relative">
								<textarea
									rows={1}
									className="w-full resize-none rounded-md border p-3 pr-12 font-poppins text-base placeholder-black focus:outline-none"
									placeholder="Send a message..."
									value={message}
									onChange={(e) => setMessage(e.target.value)}
									onKeyDown={(e) => {
										if (e.key === "Enter" && !e.shiftKey) {
											e.preventDefault();
											if (
												message.trim() !== ""
												//  ||
												// imagePrompt
											) {
												sendMessage();
											}
										}
									}}
								/>
							</div>
							<button
								type="button"
								className="absolute right-3 top-1/2 -translate-y-1/2 transform text-red-500"
								onClick={() => {
									if (message.trim() !== "") {
										// || imagePrompt) {
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
										fill={color}
									></path>
								</svg>
							</button>
						</div>
					</div>
				</div>
				<Button
					type="button"
					className="mx-4 mb-2 p-2 text-white hover:bg-black focus:outline-none"
					style={{ backgroundColor: color }}
					onClick={() => {
						if (message.trim() !== "") {
							requestImage();
						}
					}}
					// onClick={handleCameraClick}
				>
					Request an image
				</Button>
			</main>
		</>
	);
};

export default Home;
