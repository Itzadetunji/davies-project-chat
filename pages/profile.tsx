import { ArrowLeft2 } from "iconsax-react";
import React from "react";
import Image from "next/image";
import aiProfileImage from "@/public/ai-profile.png";

const Profile: React.FC = () => {
	return (
		<main className="flex w-screen flex-col">
			<nav className="relative flex w-full items-center justify-center px-7 py-2">
				<ArrowLeft2
					size="16"
					color="#000"
					className="absolute left-6"
				/>
				<p className="text-[20px] leading-[25px] tracking-[-1.5%]">
					Profile
				</p>
			</nav>
			<div className="flex flex-1 flex-col items-center py-9">
				<figure>
					<Image
						src={aiProfileImage}
						alt={""}
						className="rounded-full"
					/>
				</figure>
				<div>
					<h2 className="text-[27px] font-semibold leading-[40.5px] text-[#212121]">
						Emily Raves
					</h2>
					<div className="text-center text-[#323142] text-opacity-[0.52]">
						<p className="text-[14px] leading-[21px]">
							@emilyraves
						</p>
						<p className="text-[12px] leading-[18px]">female</p>
					</div>
				</div>
			</div>
		</main>
	);
};

export default Profile;
