import connectMongoDB from "./mongo";
import User from "@/models/user";

export const deductBalance = async (price: number, userId: string) => {
	await connectMongoDB();
  const user = await User.findOne({ _id: userId });
  if (!user || (user.non_transferable + user.transferable) < price) return false
	const rem = price - user.non_transferable;
	if (rem > 0) {
		await User.updateOne(
			{ _id: userId },
			{ $inc: { transferable: -rem }, $set: { non_transferable: 0 } }
		);
	} else {
		await User.updateOne(
			{ _id: userId },
			{ $inc: { non_transferable: -price } }
		);
	}
  return true;
};

import axios from "axios";

export async function downloadFileToBuffer(
	fileUrl: string
): Promise<Buffer | null> {
	try {
		const response = await axios({
			method: "GET",
			url: fileUrl,
			responseType: "arraybuffer", // Fetch the response as a buffer
		});

		// The response data is now a buffer containing the file's bytes
		const fileBuffer: Buffer = Buffer.from(response.data);

		return fileBuffer;
	} catch (error) {
		console.error("Error downloading the file:", error);
		return null;
	}
}
