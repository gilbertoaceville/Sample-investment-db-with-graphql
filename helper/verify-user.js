const jwt = require("jsonwebtoken");
module.exports = {
  // protected routes here
  verifyUser: async (req) => {
      let {authorization} = req.headers;
    // if no auth in headers
    if (!authorization) throw new Error("unauthorized access");
    // if auth is invalid or empty
    if (
      authorization.toString().trim().length < 4 ||
      authorization.toString().trim() === "" ||
      !authorization.toString().includes(" ")
    )
      throw new Error("unauthorized access");
    try {
      //   verify token in header
      let is_valid_user = await jwt.verify(
        authorization.split(" ")[1],
        "MONEY_MIND"
      );
      if (!is_valid_user) throw new Error("please login to continue");
      return is_valid_user;
      //   SUCCESS:
    } catch (error) {
      throw error;
    }
  },
//   end of user verification 
};
