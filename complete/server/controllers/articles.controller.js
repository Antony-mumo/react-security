import User from "../models/user.model";
import Article from "../models/article.model";
import Comment from "../models/comment.model";
import userCtrl from "./user.controller";
import _ from "lodash";

const articleNotFound = resp => {
  resp.status(404);
  throw { auth: ["Article not found"] };
};

const commentNotFound = resp => {
  return resp.status(404).json({ status: "404", error: "Not found" });
};

const articleBySlug = (req, resp, next, slug) => {
  Article.findOne({ slug: slug })
    .populate("author")
    .then(article => {
      if (!article) articleNotFound(resp);
      req.article = article;
      return next();
    })
    .catch(next);
};

const commentById = (req, resp, next, id) => {
  Comment.findById(id)
    .then(comment => {
      if (!comment) commentNotFound(resp);
      req.comment = comment;
      return next();
    })
    .catch(next);
};

const getAllArticles = (req, resp, next) => {
  var query = {};
  var limit = 20;
  var offset = 0;

  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }

  if (typeof req.query.tag !== "undefined") {
    query.tagList = { $in: [req.query.tag] };
  }
  Promise.all([
    req.query.author ? User.findOne({ username: req.query.author }) : null,
    req.query.favorited ? User.findOne({ username: req.query.favorited }) : null
  ])
    .then(function(results) {
      var author = results[0];
      var favoriter = results[1];

      if (author) {
        query.author = author._id;
      }

      if (favoriter) {
        query._id = { $in: favoriter.favorites };
      } else if (req.query.favorited) {
        query._id = { $in: [] };
      }

      return Promise.all([
        Article.find(query)
          .limit(Number(limit))
          .skip(Number(offset))
          .sort({ createdAt: "desc" })
          .populate("author")
          .exec(),
        Article.count(query).exec(),
        req.auth ? User.findById(req.auth.id) : null
      ]).then(results => {
        var articles = results[0];
        var articlesCount = results[1];
        var user = results[2];

        return resp.json({
          articles: articles.map(article => {
            return article.getArticlePacket(user);
          }),
          articlesCount: articlesCount
        });
      });
    })
    .catch(next);
};

const getFeed = (req, resp, next) => {
  var limit = 20;
  var offset = 0;

  if (typeof req.query.limit !== "undefined") {
    limit = req.query.limit;
  }

  if (typeof req.query.offset !== "undefined") {
    offset = req.query.offset;
  }

  User.findById(req.auth.id).then(user => {
    if (!user) userCtrl.userNotAuthorized(resp);

    Promise.all([
      Article.find({ author: { $in: user.following } })
        .limit(Number(limit))
        .skip(Number(offset))
        .populate("author")
        .exec(),
      Article.count({ author: { $in: user.following } })
    ])
      .then(results => {
        var articles = results[0];
        var articlesCount = results[1];

        return resp.json({
          articles: articles.map(article => {
            return article.getArticlePacket(user);
          }),
          articlesCount: articlesCount
        });
      })
      .catch(next);
  });
};

const createArticle = (req, resp, next) => {
  User.findById(req.auth.id)
    .then(user => {
      if (!user) userCtrl.userNotAuthorized(resp);

      var article = new Article(req.body.article);
      article.author = user;

      return article.save().then(() => {
        return resp.json({ article: article.getArticlePacket(user) });
      });
    })
    .catch(next);
};

const deleteArticle = (req, resp, next) => {
  User.findById(req.auth.id)
    .then(user => {
      if (!user) userCtrl.userNotAuthorized();

      if (req.article.author.id.toString() === req.auth.id.toString()) {
        return req.article.remove().then(() => {
          return resp.json({});
        });
      } else {
        return resp.sendStatus(403);
      }
    })
    .catch(next);
};

const favoriteArticle = (req, resp, next) => {
  User.findById(req.auth.id)
    .then(user => {
      if (!user) userCtrl.userNotAuthorized();

      return user.favorite(req.article.id).then(() => {
        return req.article.updateFavoriteCount().then(article => {
          return resp.json({ article: article.getArticlePacket(user) });
        });
      });
    })
    .catch(next);
};

const unfavoriteArticle = (req, resp, next) => {
  User.findById(req.auth.id)
    .then(user => {
      if (!user) userCtrl.userNotAuthorized();

      return user.unfavorite(req.article.id).then(() => {
        return req.article.updateFavoriteCount().then(article => {
          return resp.json({ article: article.getArticlePacket(user) });
        });
      });
    })
    .catch(next);
};

const getArticle = (req, resp, next) => {
  Promise.all([
    req.auth ? User.findById(req.auth.id) : null,
    req.article.populate("author").execPopulate()
  ])
    .then(results => {
      var user = results[0];
      return resp.json({ article: req.article.getArticlePacket(user) });
    })
    .catch(next);
};

const updateArticle = (req, resp, next) => {
  User.findById(req.auth.id).then(user => {
    if (req.article.author.id.toString() === req.auth.id.toString()) {
      _.extend(req.article, req.body.article);

      req.article
        .save()
        .then(article => {
          return resp.json({ article: article.getArticlePacket(user) });
        })
        .catch(next);
    } else {
      userCtrl.userNotAuthorized();
    }
  });
};

const getArticleComments = (req, resp, next) => {
  Promise.resolve(req.auth ? User.findById(req.auth.id) : null)
    .then(user => {
      return req.article
        .populate({
          path: "comments",
          populate: {
            path: "author"
          },
          options: {
            sort: {
              createdAt: "desc"
            }
          }
        })
        .execPopulate()
        .then(article => {
          return resp.json({
            comments: req.article.comments.map(comment => {
              return comment.getCommentPacket(user);
            })
          });
        });
    })
    .catch(next);
};

const deleteArticleComment = (req, resp, next) => {
  if (!req.comment || !req.comment.author) return;

  if (req.comment.author.toString() === req.auth.id.toString()) {
    req.article.comments.remove(req.comment.id);
    req.article
      .save()
      .then(
        Comment.find({ _id: req.comment.id })
          .deleteOne()
          .exec()
          .catch(resp => commentNotFound(resp))
      )
      .then(() => {
        resp.json({});
      });
  } else {
    resp.sendStatus(403);
  }
};

const createArticleComment = (req, resp, next) => {
  User.findById(req.auth.id)
    .then(user => {
      if (!user) userCtrl.userNotAuthorized(resp);

      var comment = new Comment(req.body.comment);
      comment.article = req.article;
      comment.author = user;

      return comment.save().then(() => {
        req.article.comments.push(comment);

        return req.article.save().then(article => {
          resp.json({ comment: comment.getCommentPacket(user) });
        });
      });
    })
    .catch(next);
};

export default {
  articleNotFound,
  commentNotFound,
  articleBySlug,
  commentById,
  getAllArticles,
  createArticle,
  deleteArticle,
  favoriteArticle,
  unfavoriteArticle,
  getFeed,
  getArticle,
  updateArticle,
  getArticleComments,
  deleteArticleComment,
  createArticleComment
};
