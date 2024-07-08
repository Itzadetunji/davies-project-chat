import mongoose, { Schema } from "mongoose";

const userSchema = new Schema({
  _id: String,
  non_transferable: Number,
  transferable: Number,
  first_time: Boolean,
  join_date: Date,
  last_active: Date,
  first_deposit: Boolean,
  active: String,
  freecredits: Number
});

const User = mongoose.models.User || mongoose.model("User", userSchema);

export default User;
