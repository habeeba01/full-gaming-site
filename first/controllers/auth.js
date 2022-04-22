const User = require("../models/User");
const { StatusCodes } = require("http-status-codes");
const { BadRequestError, NotFoundError, AuthenticationError } = require("../errors");

//s'inscrire
const register = async (req, res) => {
   let user = await User.findOne({ email: req.body.email });
   //l'utilisateur existe deja
   if (user) throw new BadRequestError("User already exists");
   user = await User.create({ ...req.body });
   const { _id: id, name, profileImage } = user;
   const token = user.createJWT();
   //l'ajour du user
   res.status(StatusCodes.CREATED).json({
      id,
      token,
      name,
      profileImage,
   });
};
//s'authentifier
const login = async (req, res) => {
   if (!req.body.email || !req.body.password) {
      throw new BadRequestError("Please provide email and password");
   }

   const user = await User.findOne({ email: req.body.email });

   if (!user) {
      throw new NotFoundError("Invalid credentials");
   }

   const isPasswordCorrect = await user.comparePassword(req.body.password);

   if (!isPasswordCorrect) {
      throw new AuthenticationError("Invalid credentials");
   }

   const { _id: id, name, profileImage } = user;
   const token = user.createJWT();

   res.status(StatusCodes.OK).json({
      id,
      token,
      name,
      profileImage,
   });
};



module.exports = { register, login };