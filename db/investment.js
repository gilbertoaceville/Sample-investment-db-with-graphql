const mongoose = require("mongoose");
const { Schema, model } = mongoose;
const _Date = require('moment')
const InvestmentModel = new Schema({
    investor: {
        type: mongoose.Types.ObjectId,
        ref: "user"
    },
    ref:{
        type: String,
        required: true
    },
    date: {
        type: String,
        default: _Date().format('LLLL')
    },
    due_date: {
        type: String,
        default: _Date().add(1,'week').format('LLLL')
    },
    amount: {
        type: String,
        required: true
    },
    payout_amount: {
        type: String,
        required: true
    },
    is_settled: {
        type: Boolean,
        default: false
    }
})


module.exports = model('investment', InvestmentModel)