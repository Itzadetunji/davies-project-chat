import { Storage } from "@google-cloud/storage";
import axios from "axios";

async function generateSignedUrl(bucketName: string, objectName: string, contentType: string): Promise<[string, string]> {
  const credentials = JSON.parse(process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON || '{}');
  const storage = new Storage({ credentials });
  const bucket = storage.bucket(bucketName);
  const blob = bucket.file(objectName);
  const signedUrl = await blob.getSignedUrl({
    version: "v4",
    action: "write",
    expires: Date.now() + 3600 * 1000, // 1 hour
    contentType,
  });
  const publicUrl = `https://storage.googleapis.com/${bucketName}/${objectName}`;
  return [signedUrl[0], publicUrl];
}

async function uploadFileToGcs(signedUrl: string, file: Buffer, contentType: string): Promise<[number, string]> {
  try {
    const response = await axios.put(signedUrl, file, {
      headers: {
        "Content-Type": contentType,
      },
    });
    return [response.status, response.statusText];
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return [error.response?.status || 500, error.message];
    }
    return [500, "An unknown error occurred"];
  }
}

const bucketName = "poxadroi.appspot.com";

export async function uploadGoogle(file: Buffer, contentType = "image/jpeg"): Promise<string> {
  const fileId = Math.random().toString(36).substring(2, 12) + Math.random().toString(36).substring(2, 12);
  const [signedUrl, publicUrl] = await generateSignedUrl(bucketName, fileId, contentType);

  const [status, message] = await uploadFileToGcs(signedUrl, file, contentType);
  console.log(`Upload status: ${status}, message: ${message}`);
  return publicUrl;
}

