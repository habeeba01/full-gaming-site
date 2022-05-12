const { AuthenticationError } = require("../errors");
const jwt = require("jsonwebtoken");

const authorize = (req, res, next) => {
   const authHeader = req.headers.authorization;
   if (!authHeader || !authHeader.startsWith("Bearer")) {
      throw new AuthenticationError("Authentication Invalid");
   }
   //The split() function is a string function of Node. js which is used to split string into sub-strings
   const token = authHeader.split(" ")[1];

   try {
      const payload = jwt.verify(token, process.env.JWT_SECRET);
      req.user = { id: payload.id, name: payload.name };
      next();
   } catch (error) {
      throw new AuthenticationError("Authentication Invalid");
   }
};

module.exports = authorize;
