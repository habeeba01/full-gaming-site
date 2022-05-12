let mongoose = require('mongoose');
let express = require('express');
let router = express.Router();
let Posts = require('../models/Post')
let Articles = require('../models/Article')

//rechercher un post
router.route('/').get((req, res, next) => {
  Posts.find((error, data) => {
      if (error) {
        return next(error)
      } else {
        res.json(data)
      }
    })
})
//rechercher un post et le supprimer
router.route('/delete/:id').delete((req, res, next) => {
  Posts.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data
      })
    }
  })
})


//rechercher un article
router.route('/article').get((req, res, next) => {
  Articles.find((error, data) => {
      if (error) {
        return next(error)
      } else {
        res.json(data)
      }
    })
})


//rechercher un article et le supprimer
router.route('/article/delete/:id').delete((req, res, next) => {
  Articles.findByIdAndRemove(req.params.id, (error, data) => {
    if (error) {
      return next(error);
    } else {
      res.status(200).json({
        msg: data
      })
    }
  })
})
module.exports = router;