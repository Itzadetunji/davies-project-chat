import axios from "axios";

export default async function POST(req: any, res: any) {
	const chat_id = req.query.chat_id;
	const botToken = process.env.BOT_TOKEN;
	const photo = req.body.photo;

	if (!photo){
		res.status(400).json({ error: "photo is required" });
		return
	}
	try {
		await axios.post(`https://api.telegram.org/bot${botToken}/sendPhoto`, {
			chat_id,
			photo,
		});

		res.json({ chat_id, status: "success" });
	} catch (error) {
		console.error("Error sending message:", error);
		res.status(500).json({ error: "Failed to send message" });
	}
}
