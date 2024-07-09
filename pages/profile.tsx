import { ArrowLeft2 } from "iconsax-react";
import React from "react";
import Image from "next/image";
import aiProfileImage from "@/public/ai-profile.png";
import { useUserStore } from "@/store/useUserStore";

const Profile: React.FC = () => {
	const { chat_name, photo_url, language } = useUserStore();
	return (
		<main className="flex w-screen flex-col">
			<nav className="relative flex w-full items-center justify-center px-7 py-2">
				<ArrowLeft2
					size="16"
					color="#000"
					className="absolute left-6 cursor-pointer"
					onClick={() => window.history.back()}
				/>
				<p className="text-[20px] leading-[25px] tracking-[-1.5%]">
					Profile
				</p>
			</nav>
			<div className="flex flex-1 flex-col items-center py-9">
				<figure>
					<img
						src={photo_url}
						alt="Ellipse"
						className="h-60 w-60 cursor-pointer rounded-full"
					/>
				</figure>
				<div>
					<h2 className="text-[27px] font-semibold leading-[40.5px] text-[#212121]">
						{chat_name}
					</h2>
					<div className="text-center text-[#323142] text-opacity-[0.52]">
						<p className="text-[14px] leading-[21px]">
							@{chat_name.replace(/\s+/g, "-")}
						</p>
						<p className="text-[14px] leading-[21px]">
							{language}
						</p>
					</div>
				</div>
			</div>
		</main>
	);
};

export default Profile;
