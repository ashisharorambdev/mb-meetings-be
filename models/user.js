const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  firstName: {
    type: String,
    required: true,
  },
  lastName: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
  },
  id: { required: true, type: Number },
});

userSchema.set("timestamps", true);

const User = mongoose.model("User", userSchema);

module.exports = User;
