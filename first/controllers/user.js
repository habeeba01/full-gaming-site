const { NotFoundError, BadRequestError } = require("../errors");
const User = require("../models/User");
const Post = require("../models/Post");
const { StatusCodes } = require("http-status-codes");
const fs = require("fs");
const cloudinary = require("cloudinary").v2;

const getUser = async (req, res) => {
    const { id } = req.params;
    const user = await User.findOne({ _id: id }).select({ password: 0 });

    if (!user) {
        throw new NotFoundError(`No user exist with id ${id}`);
    }

    res.status(StatusCodes.OK).json({ user });
};

const getUsers = async (req, res) => {
    const { search } = req.query;
    if (search) {
        const regex = new RegExp(search, "i");
        const user = await User.find({ name: regex }).select({ password: 0 });
        res.status(StatusCodes.OK).json({ user });
    } else {
        const user = await User.find().select({ password: 0 });
        res.status(StatusCodes.OK).json({ user });
    }
};

const getUsersByIDs = async (req, res) => {
    const ids = Object.values(req.query);
    if (!ids) throw new BadRequestError("Expected atleast one id");
    const user = await User.find({ _id: { $in: ids } }).select({ password: 0 });
    res.status(StatusCodes.OK).json({ user });
};

const updateUser = async (req, res) => {
    const { id } = req.user;
    const user = await User.findByIdAndUpdate(id, req.body, {
        new: true,
        runValidators: true,
    }).select({ password: 0 });

    await Post.updateMany({ createdBy: req.user.id }, { userDetails: { name: user.name, image: user.profileImage } });

    const posts = await Post.find({ createdBy: req.user.id }).sort("-createdAt");

    if (!user) {
        throw new NotFoundError(`No user exist with id ${id}`);
    }
    const token = user.createJWT();

    res.status(StatusCodes.OK).json({ user, token, posts });
};


const reportUser = async (req, res) => {
  const { add } = req.query;
  if (add === "true") {
     const users = await User.findById(req.body.id);
     if (!users) throw new NotFoundError(`No user with id${req.body.id}`);

     if (users.report.includes(req.user.id)) {
        throw new BadRequestError("Already reported");
     } else {
        const users = await User.findByIdAndUpdate(
           req.body.id,
           {
              $push: { report: req.user.id },
           },
           { new: true, runValidators: true }
        );
        res.status(StatusCodes.OK).json({ users });
     }
  } else if (add === "false") {
     const users= await User.findByIdAndUpdate(
        req.body.id,
        {
           $pull: { report: req.user.id },
        },
        { new: true, runValidators: true }
     );
     if (!users) throw new NotFoundError(`No user with id${req.body.id}`);
     res.status(StatusCodes.OK).json({ users});
  } else {
     throw new BadRequestError("Invalid url");
  }
};

const updateDP = async (req, res) => {
    const image = req.files?.image;
    if (!image) {
        throw new BadRequestError("Expected an image");
    }
    const result = await cloudinary.uploader.upload(image.tempFilePath, {
        use_filename: true,
        folder: "fb-clone-dps",
    });
    fs.unlinkSync(image.tempFilePath);
    const { secure_url: src } = result;

    const user = await User.findByIdAndUpdate(req.user.id, { profileImage: src }, { new: true, runValidators: true }).select({ password: 0 });

    await Post.updateMany({ createdBy: req.user.id }, { userDetails: { name: user.name, image: user.profileImage } });

    const posts = await Post.find({ createdBy: req.user.id });

    if (!user) throw new NotFoundError(`No user exist with id ${req.user.id}`);

    res.status(StatusCodes.OK).json({ user, posts });
};

//get friends
const getFriends =  async (req, res) => {
    try {
      const user = await User.findById(req.params.userId);
      const friends = await Promise.all(
        user.followings.map((friendId) => {
          return User.findById(friendId);
        })
      );
      let friendList = [];
      friends.map((friend) => {
        const { _id, name, profileImage} = friend;
        friendList.push({ _id, name, profileImage });
      });
      res.status(200).json(friendList)
    } catch (err) {
      res.status(500).json(err);
    }
  };
  
  //follow a user
  
 const follow =  async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (!user.followers.includes(req.body.userId)) {
          await user.updateOne({ $push: { followers: req.body.userId } });
          await currentUser.updateOne({ $push: { followings: req.params.id } });
          res.status(200).json("user has been followed");
        } else {
          res.status(403).json("you allready follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant follow yourself");
    }
  };
  
  //unfollow a user
  
  const unfollow =  async (req, res) => {
    if (req.body.userId !== req.params.id) {
      try {
        const user = await User.findById(req.params.id);
        const currentUser = await User.findById(req.body.userId);
        if (user.followers.includes(req.body.userId)) {
          await user.updateOne({ $pull: { followers: req.body.userId } });
          await currentUser.updateOne({ $pull: { followings: req.params.id } });
          res.status(200).json("user has been unfollowed");
        } else {
          res.status(403).json("you dont follow this user");
        }
      } catch (err) {
        res.status(500).json(err);
      }
    } else {
      res.status(403).json("you cant unfollow yourself");
    }
  };
module.exports = { getUser,reportUser, updateUser, updateDP, getUsers, getUsersByIDs,unfollow,follow,getFriends };
