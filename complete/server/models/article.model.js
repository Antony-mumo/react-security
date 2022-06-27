import mongoose from "mongoose";
import dbValidator from "mongoose-unique-validator";
import slug from "slug";

import User from "./user.model";
import Comment from "./comment.model";

var ArticleSchema = new mongoose.Schema(
  {
    slug: { type: String, lowercase: true, unique: true },
    title: String,
    description: String,
    body: String,
    favoritesCount: { type: Number, default: 0 },
    comments: [{ type: mongoose.Schema.Types.ObjectId, ref: "Comment" }],
    tagList: [{ type: String }],
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" }
  },
  { timestamps: true }
);

ArticleSchema.plugin(dbValidator, { message: "is already taken" });

ArticleSchema.pre("validate", function(next) {
  if (!this.slug) {
    this.slugify();
  }

  next();
});

ArticleSchema.methods = {
  getArticlePacket: function(viewingUser) {
    return {
      title: this.title,
      slug: this.slug,
      body: this.body,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      tagList: this.tagList,
      description: this.description,
      author: this.author.getAuthorPacket(viewingUser),
      favorited: viewingUser ? viewingUser.isFavorite(this._id) : false,
      favoritesCount: this.favoritesCount
    };
  },

  slugify: function() {
    this.slug =
      slug(this.title) +
      "-" +
      ((Math.random() * Math.pow(36, 6)) | 0).toString(36);
  },

  updateFavoriteCount: function() {
    var article = this;

    return User.count({ favorites: { $in: [article._id] } }).then(count => {
      article.favoritesCount = count;
      return article.save();
    });
  }
};

export default mongoose.model("Article", ArticleSchema);
