const { BadRequestError, NotFoundError } = require("../errors");
const Article = require("../models/Article");
const User = require("../models/User");
//file system module helps us store, access, and manage data on our operating system
const fs = require("fs");
//Il est utilisé pour analyser les données de formulaire, principalement les téléchargements de fichiers.
const cloudinary = require("cloudinary").v2;
const { StatusCodes } = require("http-status-codes");


//creation d'un article
const createArticles = async (req, res) => {
   //apres l'entrée de la description et le prix de l'article
    const { caption ,prix} = req.body;
    //apres l'upload de l'image
    const image = req.files?.image;
    //handling exception because this three line are required
    if (!caption && !image && !prix) {
       throw new BadRequestError("Expected a caption or image");
    }
    //trouver le respo sur l'article
    const user = await User.findById(req.user.id);
    //uploading image 
    if (image) {
       const result = await cloudinary.uploader.upload(image.tempFilePath, {
          use_filename: true,
          folder: "fb-clone-posts",
       });
       fs.unlinkSync(image.tempFilePath);
       const { secure_url: src, public_id } = result;
       //creation de l'article
       const article = await Article.create({
          caption,
          prix,
          image: { src, publicID: public_id },
          createdBy: user._id,
          userDetails: { name: user.name, image: user.profileImage },
       });
       res.status(StatusCodes.CREATED).json({ article });
    } else {
       const article = await Article.create({
          caption,
            prix,
          createdBy: user._id,
          userDetails: { name: user.name, image: user.profileImage },
       });
       res.status(StatusCodes.CREATED).json({ article });
    }
 };
//trouver un article
 const getArticles = async (req, res) => {
   const { by, search } = req.query;
   //searching by the creater
   if (by) {
      let articles = await Article.find({ createdBy: by }).sort("-createdAt");
      res.status(StatusCodes.OK).json({ articles });
   } else if (search) {
      const regex = new RegExp(search, "i");
      const articles = await Article.find({ caption: regex }).sort("-createdAt");
      res.status(StatusCodes.OK).json({ articles });
   } else {
      const articles = await Article.find().sort("-createdAt");
      res.status(StatusCodes.OK).json({ articles });
   }
};

//non trouvable
const getArticle = async (req, res) => {
   const { id } = req.params;
   const articles = await Article.findById(id);
   if (!articles) throw new NotFoundError(`No article with id${id}`);
   res.status(StatusCodes.OK).json({ articles });
};
 
//aimer un article
 const likeArticle = async (req, res) => {
    const { add } = req.query;
    if (add === "true") {
       const articles = await Article.findById(req.body.id);
       //non trouvable
       if (!articles) throw new NotFoundError(`No article with id${req.body.id}`);
         //operation deja faite
       if (articles.likes.includes(req.user.id)) {
          throw new BadRequestError("Already liked");
       } else {
          //
          const articles = await Article.findByIdAndUpdate(
             req.body.id,
             {
                $push: { likes: req.user.id },
             },
             { new: true, runValidators: true }
          );
          res.status(StatusCodes.OK).json({ articles });
       }
    } else if (add === "false") {
       const articles = await Article.findByIdAndUpdate(
          req.body.id,
          {
             $pull: { likes: req.user.id },
          },
          { new: true, runValidators: true }
       );
       if (!articles) throw new NotFoundError(`No article with id${req.body.id}`);
       res.status(StatusCodes.OK).json({ articles });
    } else {
       throw new BadRequestError("Invalid url");
    }
 };
 
 //signaler un article
 const reportArticle = async (req, res) => {
   const { add } = req.query;
   if (add === "true") {
      const articles = await Article.findById(req.body.id);
      if (!articles) throw new NotFoundError(`No article with id${req.body.id}`);

      if (articles.report.includes(req.user.id)) {
         throw new BadRequestError("Already reported");
      } else {
         const articles = await Article.findByIdAndUpdate(
            req.body.id,
            {
               $push: { report: req.user.id },
            },
            { new: true, runValidators: true }
         );
         res.status(StatusCodes.OK).json({ articles });
      }
   } else if (add === "false") {
      const articles = await Article.findByIdAndUpdate(
         req.body.id,
         {
            $pull: { report: req.user.id },
         },
         { new: true, runValidators: true }
      );
      if (!articles) throw new NotFoundError(`No article with id${req.body.id}`);
      res.status(StatusCodes.OK).json({ articles });
   } else {
      throw new BadRequestError("Invalid url");
   }
};

 const commentArticle = async (req, res) => {
    const articles = await Article.findByIdAndUpdate(
       req.body.id,
       {
          $push: { comments: { commentedBy: req.user.id, comment: req.body.comment } },
       },
       { new: true, runValidators: true }
    );
 
    if (!articles) throw new NotFoundError(`No article with id${req.body.id}`);
 
    res.status(StatusCodes.OK).json({ articles });
 };
 
 const deleteArticle = async (req, res) => {
    const { id } = req.params;
    const article = await Article.findOneAndDelete({ _id: id, createdBy: req.user.id });
    await cloudinary.uploader.destroy(article.image?.publicID);
    res.status(StatusCodes.OK).json(article);
 };
 
 module.exports = { createArticles,reportArticle, getArticles, likeArticle, commentArticle, getArticle, deleteArticle };
 