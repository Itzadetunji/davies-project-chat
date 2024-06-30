import { ArrowLeft2 } from "iconsax-react";
import Image from "next/image";
import Ellipse from "../public/ellipse.png";
import Camera from "@/public/camera.png";

const Home = () => {
	return (
		<>
			<main className="w-full">
				<div className="bg-peach p-4">
					<div className="flex flex-row items-center gap-[93px]">
						<button>
							<ArrowLeft2 size="16" color="#fcf9f7" />
						</button>
						<h1 className="font-poppins text-xl">Emily Raves</h1>
						<Image
							src={Ellipse}
							width={34}
							height={34}
							quality={100}
							alt={""}
						/>
					</div>
				</div>
			</main>

			<div>
				<Image
					src={Camera}
					className="bottom-image"
					width={20}
					height={18}
					alt={""}
				/>
				<textarea name="" id=""></textarea>
			</div>
		</>
	);
};

export default Home;
