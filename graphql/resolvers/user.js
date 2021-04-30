// import the usermodel from database
const bcrypt = require("bcryptjs");
const User = require("../../db/user");
const jwt = require("jsonwebtoken");
const { verifyUser } = require("../../helper/verify-user");
const bluebird = require("bluebird");
const fetch = require('node-fetch')
fetch.promise = bluebird.Promise;
module.exports = {
  // creation of a user on the platform
  register_user: async ({
    email,
    password,
    full_name,
    phone,
    bank_name,
    bank_account_name,
    bank_account_number,
  }) => {
    try {
      // verify if email exist
      let emailExist = await User.findOne({ email });
      if (emailExist) throw new Error(`${email} has already been used`);
      // verify number
      let phoneExist = await User.findOne({ phone });
      if (phoneExist) throw new Error(`${phone} has already been used`);
      // generate salt and a pwd hash
      let salt = await bcrypt.genSalt(12);
      let hash = await bcrypt.hash(password, salt);
      // user obj instance
      let userInstance = new User({
        banking_details: { bank_name, bank_account_name, bank_account_number },
        email,
        password: hash,
        full_name,
        phone,
      });
      let savedUser = await userInstance.save();
      // token
      let userDetails = { ...savedUser._doc, password: "" };
      let token = jwt.sign(userDetails, "MONEY_MIND");
      return { ...userDetails, token };
    } catch (error) {
      throw error;
    }
  },

  // login a user to the platform and sign the token
  // @params /graphql
  //@Route this is a mutation to login a user
  login_user: async ({ email, password }) => {
    try {
      // check email if email is correct and password is not empty
      if (
        !email.toString().includes("@") ||
        !email.toString().includes(".") ||
        email.toString().trim().length < 4
      )
        throw new Error("please enter a valid email address");
      // validate the pwd filed
      if (!password.toString().trim().length > 6)
        throw new Error("password must up the 6 characters long");
      // check if the email really exist in the database
      let emailReallyExist = await User.findOne({ email }).populate(
        "investments"
      );
      if (!emailReallyExist) throw new Error("invalid email or password");
      // if the email correct, then check if the password is same as the hashed password
      let passwordIsMatch = await bcrypt.compare(
        password,
        emailReallyExist.password
      );
      if (!passwordIsMatch) throw new Error("invalid email or password");
      // if the details match, then we sign the token
      emailReallyExist._doc.password = "";
      
      let token = jwt.sign(
        {
          ...emailReallyExist._doc,
          investments: emailReallyExist._doc.investments
            ? emailReallyExist._doc.investments
            : [],
        },
        "MONEY_MIND"
      );

      // return
      return { 
          ...emailReallyExist._doc,
          investments: emailReallyExist._doc.investments
            ? emailReallyExist._doc.investments
            : [], token };
    } catch (error) {
      throw error;
    }
  },

  // @params change_password mutation
  change_password: async (
    { current_password = "", new_password = "" },
    req
  ) => {
    try {
      if (new_password.toString().trim().length < 4) {
        throw new Error("password length must be up to 6 characters ");
      }
      if (
        current_password.toString().toLowerCase().trim() ===
        new_password.toString().toLowerCase().trim()
      ) {
        throw new Error("old password must be different from the new password");
      }
      let user = await verifyUser(req);
      if (!user) throw new Error("authorization access");
      // visit db here to confirm the id of the user
      let main_user = await User.findOne({ _id: user._id });
      if (!main_user) throw new Error("authorized access");
      let old_password_match = await bcrypt.compare(
        current_password,
        main_user._doc.password
      );
      if (!old_password_match) throw new Error("old password doest not match");
      // change pwd here for real
      // gen salt
      let salt = await bcrypt.genSalt(12);
      let password = await bcrypt.hash(new_password, salt);
      await User.update({ _id: user._id }, { password }, { new: true });
      return "password changed successfully";
    } catch (error) {
      throw error;
    }
  },
  // @params forgot password
  // reset the user password
  // send sms with the new password
  send_otp: async ({ email }) => {
    try {
      let user = await User.findOne({ email });
      if (!user) throw new Error("action not allowed");
      // gen random number here
      let all_numbers = "1234567890";
      let otp = "";
      for (let i = 0; i <= 4; i++) {
        let random_number = Math.floor(Math.random() * all_numbers.length);
        otp += all_numbers.substring(random_number, random_number + 1);
      }
      // after otp is generated
      // update the user otp
        await User.findOneAndUpdate({ email }, {  otp });
      let newpwd = await User.findOne({email})
      let salt = await bcrypt.genSalt(12);
      let hash = await bcrypt.hash(newpwd._doc.otp,salt)
       await User.findOneAndUpdate({ email }, {  password: hash });
      fetch(`https://account.kudisms.net/api/?username=${process.env.KUDA_USERNAME}&password=${process.env.KUDA_PASSWORD}.&message=new password on ${process.env.WEBSITE} ${newpwd._doc.otp} &sender=${process.env.WEBSITE}&mobiles=${user._doc.phone}`)
      .then(res=>res.json())
      .then(res=>{
        console.log(res)})
        .catch(e=> {throw new Error("network connection lost")})
        return `your new password has been sent to ${user._doc.phone}`;
      // FIXME: send sms here then return
    }catch (error) {
      throw error;
    }
  },
  verify_otp: async ({ code, email }) => {
    try {
      let user = await User.findOne({ email });
      if (!user) throw new Error("unauthorized access");
      // if valid user
      // compare otp if it matches
      if (code.toString() == user._doc.otp) {
        return "please change your password";
      } else {
        throw new Error("invalid code");
      }
    } catch (error) {
      throw error;
    }
  },
};
