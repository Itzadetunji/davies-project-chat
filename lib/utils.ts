import connectMongoDB from "./mongo";
import User from "@/models/user"


export const deductBalance = async (price:number, user: any) => {
  await connectMongoDB()
  const rem = price - user.non_transferable;
  if (rem > 0) {
    await User.updateOne(
      { _id: user._id },
      { $inc: { transferable: -rem }, $set: { non_transferable: 0 } }
    );
  } else {
    await User.updateOne(
      { _id: user._id },
      { $inc: { non_transferable: -price } }
    );
  }
};

import axios from 'axios';

export async function downloadFileToBuffer(fileUrl: string): Promise<Buffer | null> {
  try {
    const response = await axios({
      method: 'GET',
      url: fileUrl,
      responseType: 'arraybuffer', // Fetch the response as a buffer
    });

    // The response data is now a buffer containing the file's bytes
    const fileBuffer: Buffer = Buffer.from(response.data);

    return fileBuffer;
  } catch (error) {
    console.error('Error downloading the file:', error);
    return null;
  }
}
