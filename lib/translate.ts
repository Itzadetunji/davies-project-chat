import { v2 } from "@google-cloud/translate";
import { franc } from "franc";
import { languageMap} from "./vars";


// Parse the service account key from the environment variable
const serviceAccountKey = JSON.parse(
    process.env.GOOGLE_APPLICATION_CREDENTIALS_JSON as string
);
const translate = new v2.Translate({ credentials: serviceAccountKey });

export async function translateText(
	text: string,
	targetLanguage: string
): Promise<string> {
	// // Initialize the Translation client with the service account key
	try {
		const [translation] = await translate.translate(text, targetLanguage);
		return translation;
	} catch (error) {
		return text
	}
}   

export async function detectLanguage(text:string): Promise<string> {
    try {
        const [detection] = await translate.detect(text);
        return detection.language;
    } catch (error) {
        console.error('Error detecting language:', error);
        throw error;
    }
}
