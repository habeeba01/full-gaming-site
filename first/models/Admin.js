const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {ObjectId} = mongoose.Schema.Types

const AdminSchema = new mongoose.Schema(
   {
     
      email: {
         type: String,
         required: [true, "Please provide email"],
         match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
         ],
         unique: true,
      },
    
     
      password: {
         type: String,
         required: [true, "Please provide password"],
         
      },
    },
   { timestamps: true }
);

AdminSchema.pre("save", async function () {
   const salt = await bcrypt.genSalt();
   this.password = await bcrypt.hash(this.password, salt);
});

AdminSchema.methods.createJWT = function () {
   return jwt.sign(
      { id: this._id, email: this.email},
      process.env.JWT_SECRET,
      {
         expiresIn: process.env.JWT_LIFETIME,
      }
   );
};

AdminSchema.methods.comparePassword = async function (pw) {
   const isCorrect = await bcrypt.compare(pw, this.password);
   return isCorrect;
};
module.exports = mongoose.model("Admin", AdminSchema);
