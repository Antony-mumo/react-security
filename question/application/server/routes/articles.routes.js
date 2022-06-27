import express from "express";
import articlesCtrl from "../controllers/articles.controller";
import authCtrl from "../controllers/auth.controller";

const router = express.Router();

router.param("article", articlesCtrl.articleBySlug);
router.param("comment", articlesCtrl.commentById);

router.get("/articles", authCtrl.signinIsOptional, articlesCtrl.getAllArticles);
router.post("/articles", authCtrl.requireSignin, articlesCtrl.createArticle);
router.delete(
  "/articles/:article",
  authCtrl.requireSignin,
  articlesCtrl.deleteArticle
);
router.post(
  "/articles/:article/favorite",
  authCtrl.requireSignin,
  articlesCtrl.favoriteArticle
);
router.delete(
  "/articles/:article/favorite",
  authCtrl.requireSignin,
  articlesCtrl.unfavoriteArticle
);
router.get("/articles/feed", authCtrl.requireSignin, articlesCtrl.getFeed);
router.get(
  "/articles/:article",
  authCtrl.signinIsOptional,
  articlesCtrl.getArticle
);
router.put(
  "/articles/:article",
  authCtrl.requireSignin,
  articlesCtrl.updateArticle
);
router.get(
  "/articles/:article/comments",
  authCtrl.signinIsOptional,
  articlesCtrl.getArticleComments
);
router.delete(
  "/articles/:article/comments/:comment",
  authCtrl.requireSignin,
  articlesCtrl.deleteArticleComment
);
router.post(
  "/articles/:article/comments",
  authCtrl.requireSignin,
  articlesCtrl.createArticleComment
);

export default router;
