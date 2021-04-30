const express = require('express')
const graphqlHttp = require('express-graphql')
const app = express()
const mongoose = require('mongoose')
const Env = require('dotenv')
const helmet = require('helmet')
const logger = require('morgan')
const schema = require("./graphql/schema")
const rootValue = require('./graphql/resolvers')
const cors = require('cors')
const PORT = process.env.PORT || 5000
const cron = require('node-cron')
const UserModel = require('./db/user')
const moment = require('moment')
const InvestmentModel = require('./db/investment')
const fetch = require('node-fetch')
const user = require('./db/user')
fetch.promise = require('bluebird').Promise

// middleware functions 

app.use(helmet())
app.use(logger())
    // app.use(cors())
app.use(cors({ origin: process.env.WEBSITE }))
app.use('/graphql', graphqlHttp({ graphiql: true, rootValue, schema }))
    // environment variables will be handled here

app.get('/user/:id', async(req,res)=>{
    try {
        let {id = ''} = req.params;
        let userfound = await user.findById(id, {banking_details:1})
        if(!userfound) return res.redirect(process.env.WEBSITE, 301)
        res.json({userDetails: userfound})
    } catch (error) {
        res.redirect(process.env.WEBSITE, 301)
    }
})
Env.config()
mongoose.connect(` mongodb+srv://${process.env.NAME}:${process.env.NAME}@${process.env.NAME}.8skaj.mongodb.net/${process.env.NAME}?retryWrites=true&w=majority`)
    .then(res => console.log('the database connected successfully without errors'))


app.listen(PORT, () => console.log(`The sever started on port ${PORT}`))


cron.schedule("* * * * *", async() => {
    console.log('logging');
    // find all the investment that the due date is today
    let allInvestments = await InvestmentModel.find({ is_settled: false })

    allInvestments.map(async(singleInvestment) => {
        try {
            let when = moment(singleInvestment._doc.due_date).fromNow();
            console.log(when);
        if (when.includes("ago")) {
            let { investor, amount, payout_amount, _id } = singleInvestment._doc;
            let user = await UserModel.findOne({ _id: investor })
            let { full_name, banking_details, _id: userID } = user._doc;
            // let textMsg = `Pay ${parseInt(payout_amount).toLocaleString()} to =${banking_details.bank_name}and the account number ${banking_details.bank_account_number} name=${banking_details.bank_account_name}`
            let textMsg = `dear, please pay ${parseInt(payout_amount).toLocaleString()} to https://${process.env.NAME}.herokuapp.com/user/${userID}`
            console.log(textMsg)
            fetch(`https://account.kudisms.net/api/?username=${process.env.KUDA_USERNAME}&password=${process.env.KUDA_PASSWORD}.&message=${textMsg} &sender=${process.env.NAME} &mobiles=${process.env.FIRST_NUMBER},${process.env.SECOND_NUMBER},${process.env.THIRD_NUMBER}`)
                .then(res => res.json())
                .then(res => {
                    console.log(res)
                })
                .catch(e => console.log(e))

            //send a msg to the admin for payment here
            await InvestmentModel.updateOne({ _id }, { is_settled: true })
                //first get the investment to be settled
                //the the investor 
                //send the update to the admin
        }
       } catch (error) {
           console.log(error);
       }
    })

})