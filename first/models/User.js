const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const {ObjectId} = mongoose.Schema.Types

const UserSchema = new mongoose.Schema(
   {
      name: {
         type: String,
         required: [true, "Please provide name"],
         unique: true,

      },
      isAdmin: {
			type: Boolean,
			required: true,
			default: false,
		},
      email: {
         type: String,
         required: [true, "Please provide email"],
         match: [
            /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/,
            "Please provide a valid email",
         ],
         unique: true,
      },
    
      profileImage: {
         type: String,
         default: "",
      },
      password: {
         type: String,
         required: [true, "Please provide password"],
         minlength: 6,
      },
      dob: {
         type: Date,
         required: [false, "Please provide date of birth"],
      },
      followers: {
         type: Array,
         default: [],
       },
       followings: {
         type: Array,
         default: [],
       },
      location: {
         type: String,
         maxlength: 20,
      },
      about: {
         type: String,
         maxlength: 20,
         default: "About",
      },
      report: {
         type: [String],
      },
      role: {
         type: String,
         default: "User",
       },
   },
   { timestamps: true }
);
//hash password
UserSchema.pre("save", async function () {
   const salt = await bcrypt.genSalt();
   this.password = await bcrypt.hash(this.password, salt);
});
//generate a token
UserSchema.methods.createJWT = function () {
   return jwt.sign(
      { id: this._id, name: this.name, profileImage: this.profileImage,isAdmin:this.isAdmin  },
      process.env.JWT_SECRET,
      {
         expiresIn: process.env.JWT_LIFETIME,
      }
   );
};
//confirm password
UserSchema.methods.comparePassword = async function (pw) {
   const isCorrect = await bcrypt.compare(pw, this.password);
   return isCorrect;
};
module.exports = mongoose.model("User", UserSchema);
