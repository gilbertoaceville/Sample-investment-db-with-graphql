const mongoose = require("mongoose");
const { Schema, model } = mongoose;

const UserModel = new Schema({
  email: {
    type: String,
    required: true,
    unique: true,
  },
  phone: {
    type: String,
    required: true,
    unique: true,
  },
  full_name: {
    type: String,
    required: true,
  },
  password:{
      type: String,
      required: true
  },
  otp:{
    type: String,
  },
  investments: {
    type: mongoose.Types.ObjectId,
    ref: "investment"
  },
  // user banking details || information
  banking_details: {
    bank_name: {
      type: String,
    },
    bank_account_number: {
      type: String,
    },
    bank_account_name: {
      type: String,
    },
  },
});

module.exports = model("user", UserModel);
