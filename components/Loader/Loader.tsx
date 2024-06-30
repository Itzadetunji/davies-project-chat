import React from "react";
import "./loader.css";

const Loader: React.FC<{ isWhite?: boolean; size?: number }> = ({
	isWhite,
	size = 48,
}) => {
	const scaleFactor = size ? size / 48 : 1;
	return (
		<div
			style={{
				transform: `scale(${scaleFactor})`,
			}}
			className="flex items-center justify-center"
		>
			<span
				className={`loader h-12 w-12 ${
					isWhite
						? "!border-[#195388] !border-b-white"
						: "!border-white !border-b-[#195388]"
				}`}
			/>
		</div>
	);
};

export default Loader;
