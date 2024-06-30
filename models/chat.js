import mongoose, { Schema } from "mongoose";

const chatSchema = new Schema({
  chat_name: String,
  genre: String,
  photo_url: String,
  messages: [],
});

const Chat = mongoose.models.Chat || mongoose.model("Chat", chatSchema);

export default Chat;
