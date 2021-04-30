const Investment = require("../../db/investment");
const User = require("../../db/user");
const { verifyUser } = require("../../helper/verify-user");
const investment = require("../../db/investment");
module.exports = {
  create_investment: async ({ amount,ref }, req) => {
    if (+amount < 1000) {
      throw new Error("the minimum amount for investment is N1,000");
    }
    // verify the user that creates the investment
    try {
      let user = await verifyUser(req);
      if (!user) throw new Error("unauthorized access");
      // find all investments and know the last price he invested
      let allInvestments = await Investment.find({ investor: user._id });
      if (allInvestments.length < 1) {
        let newInvest = new Investment({
          amount,
          ref,
          payout_amount: +amount + (+amount / 2),
          investor: user._id,
        });
        let createdInvestment = await newInvest.save();
        return createdInvestment;
      }
      //if the user already has money in the platform  
      else {
        let prevAmount = +allInvestments[allInvestments.length - 1].amount;
        let nextAmount = parseInt(+prevAmount + (+allInvestments[allInvestments.length - 1].amount / 4));
        if (+amount <= prevAmount || +amount < nextAmount) {
          throw new Error(
            `the least amount you can invest is N${nextAmount.toLocaleString()}`
          );
        }

        let newInvest = new Investment({
          amount,
          ref,
          payout_amount: +amount + +amount / 2,
          investor: user._id,
        });
        let createdInvestment = await newInvest.save();
        return createdInvestment;
      }
    } catch (error) {
      throw error;
    }
  },

  // get investment by id
  get_investment_by_id: async ({ _id }, req) => {
    try {
      let user = await verifyUser(req);
      if (!user) throw new Error("unauthorized access");
      let found_investment = await Investment.findOne({ _id });
      return found_investment;
    } catch (error) {
      throw error;
    }
  },
  get_all_investment: async ({ email }, req) => {
    try {
      let user = await verifyUser(req);
      if (!user) throw new Error("unauthorized access");
      if (email) {
          let userF = await User.findOne({email})
          if(!user) throw new Error('no user found in db ')
        // admin privilege
        let found_investment = await Investment.find({ investor: userF._doc._id });
        
        return found_investment;
      } else {
        let found_investment = await Investment.find({ investor: user._id });
        return found_investment;
      }
    } catch (error) {
      throw error;
    }
  },

//   get next amount to invest 
get_next_invest: async (args, req) =>{
    try {
        let investor = await verifyUser(req)
        if(!investor)  throw new Error('unauthorized access')
        let allInvestments = await Investment.find({investor: investor._id})
        
        if(allInvestments.length < 1 )   return 1000
        return parseInt((+allInvestments[allInvestments.length -1 ].amount ) + (+allInvestments[allInvestments.length -1 ].amount  / 4))
    } catch (error) {
        throw error
    }
}
};
