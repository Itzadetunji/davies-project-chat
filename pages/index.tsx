import { ArrowLeft2 } from "iconsax-react";
import Image from "next/image";
import { useEffect, useState, useRef } from "react";
import { useRouter } from "next/router";
import Ellipse from "../public/ellipse.png";
import Camera from "../public/camera.png";
import Send from "../public/send.png";
import { io } from "socket.io-client";

interface Message {
	role: string;
	content: string;
}

const socket = io({ path: "/api/socket" });

const Home = () => {
	const fileInputRef = useRef<HTMLInputElement | null>(null);
	const messagesEndRef = useRef<HTMLDivElement | null>(null);

	const handleCameraClick = () => {
		if (fileInputRef.current) {
			fileInputRef.current.click();
		}
	};

	const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
		const file = event.target.files?.[0];
		if (file) {
			// Handle the selected file (e.g., upload it or display it)
			console.log(file);
		}
	};

	const [message, setMessage] = useState<string>("");
	const [imagePrompt, setImagePrompt] = useState<string>("");
	const [messages, setMessages] = useState<Message[]>([]);
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

			socket.on("allMessages", (msgs: Message[]) => {
				setMessages(msgs);
			});

			socket.on("responseMessage", (msg: Message) => {
				setMessages((prevMessages) => [...prevMessages, msg]);
			});
		}
	}, [router.query]);

	const sendMessage = () => {
		const newMessage: Message = { role: "user", content: message };
		setMessages((prevMessages) => [...prevMessages, newMessage]);
		socket.emit("newMessage", {
			messages: [...messages, newMessage],
			chatId,
			userId,
		});
		setMessage("");
	};

	const requestImage = () => {
		const newMessage: Message = { role: "user", content: imagePrompt };
		setMessages((prevMessages) => [...prevMessages, newMessage]);
		socket.emit("requestImage", {
			messages: [...messages, newMessage],
			chatId,
			userId,
		});
		setImagePrompt("");
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
			<main className="relative w-full">
				<div className="w-full rounded-b-xl bg-peach p-5">
					<div className="flex flex-row items-center justify-around space-x-20">
						<button>
							<ArrowLeft2 size="16" color="#fcf9f7" />
						</button>
						<h1 className="font-poppins text-xl">Emily Raves</h1>
						<Image
							src={Ellipse}
							width={34}
							height={34}
							quality={100}
							alt="Ellipse"
						/>
					</div>
				</div>
			</main>
			<div className="fixed bottom-0 left-0 flex w-full items-center justify-center p-4">
				<div className="flex w-full max-w-xl items-center">
					<button
						type="button"
						className="p-2 text-gray-500 hover:text-blue-500 focus:outline-none"
						onClick={handleCameraClick}
					>
						<Image
							src={Camera}
							width={20}
							height={18}
							alt="Camera"
							onClick={requestImage}
						/>
					</button>
					<input
						type="file"
						accept="image/*"
						capture="environment"
						ref={fileInputRef}
						onChange={handleFileChange}
						className="hidden"
					/>
					<div className="relative mx-2 flex-grow">
						<textarea
							className="h-12 max-h-36 w-full resize-none overflow-y-auto rounded-md border p-4 pr-12 font-poppins text-base placeholder-black focus:outline-none"
							placeholder="Send a message..."
							value={message}
							onChange={(e) => setMessage(e.target.value)}
							onKeyDown={(e) => {
								if (e.key === "Enter" && !e.shiftKey) {
									e.preventDefault();
									sendMessage();
								}
							}}
						/>

						<button
							type="button"
							className="absolute right-3 top-1/2 -translate-y-1/2 transform text-red-500"
							onClick={sendMessage}
						>
							<Image src={Send} alt="Send" />
						</button>
					</div>
				</div>
			</div>
			<div className="p-4 overflow-y-auto max-h-screen">
				{messages.map(({ role, content }, index) => (
					<div key={index} className="my-2">
						{role === "user" ? "👨: " : "🤖: "} {content}
					</div>
				))}
				<div ref={messagesEndRef} />
			</div>
		</>
	);
};

export default Home;
