import mongoose from "mongoose";
import crypto from "crypto";
import Article from "./article.model";
import Comment from "./comment.model";
import dbValidator from "mongoose-unique-validator";
import config from "./../config/config";
import jwt from "jsonwebtoken";

var UserSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "user name cannot be blank"],
      match: [/^[a-zA-Z0-9]+$/, "is invalid"],
      index: true
    },
    email: {
      type: String,
      lowercase: true,
      unique: true,
      required: [true, "email cannot be blank"],
      match: [/\S+@\S+\.\S+/, "is invalid"],
      index: true
    },
    bio: String,
    image: String,
    favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Article" }],
    following: [{ type: mongoose.Schema.Types.ObjectId, ref: "User" }],
    hashed_password: String,
    salt: String
  },
  { timestamps: true }
);

UserSchema.plugin(dbValidator, { message: "has already been taken" });

UserSchema.virtual("password")
  .set(function(password) {
    this._password = password;
    this.salt = this.genSalt();
    this.hashed_password = this.hashPassword(password, this.salt);
  })
  .get(function() {
    return this._password;
  });

UserSchema.virtual("JWT").get(function() {
  return jwt.sign({ id: this._id }, config.jwtSecret);
});

UserSchema.virtual("signupPacket").get(function() {
  return {
    user: {
      id: this.id,
      username: this.username,
      email: this.email,
      createdAt: this.createdAt,
      updatedAt: this.updatedAt,
      bio: this.bio ? this.bio : null,
      image: this.image ? this.image : null,
      token: this.JWT
    }
  };
});

UserSchema.path("hashed_password").validate(function(v) {
  if (this._password && this._password.length < 6) {
    this.invalidate("password", "Password must be at least 6 characters.");
  }
  if (this.isNew && !this._password) {
    this.invalidate("password", "Password is required");
  }
}, null);

UserSchema.methods = {
  genSalt: function() {
    return crypto.randomBytes(16).toString("hex");
  },

  hashPassword: function(password, salt) {
    return crypto
      .pbkdf2Sync(password, salt, 10000, 512, "sha512")
      .toString("hex");
  },

  passwordIsValid: function(password) {
    return this.hashPassword(password, this.salt) === this.hashed_password;
  },

  getProfilePacket: function(follower) {
    return {
      profile: {
        username: this.username,
        bio: this.bio ? this.bio : null,
        image: this.image ? this.image : null,
        following: this.isFollowedBy(follower)
      }
    };
  },

  getAuthorPacket: function(author) {
    return {
      username: this.username,
      bio: this.bio ? this.bio : null,
      image: this.image ? this.image : null,
      following: this.isFollowedBy(null)
    };
  },

  isFollowedBy: function(user) {
    return user ? user.isFollowing(this.id) : false;
  },

  isFollowing: function(userId) {
    return (
      userId &&
      this.following &&
      this.following.some(function(followId) {
        return followId.toString() === userId.toString();
      })
    );
  },

  follow: function(userId) {
    if (!this.following || this.following.length === 0)
      this.following = [userId];
    else if (this.following.indexOf(userId) === -1) {
      this.following.push(userId);
    }

    return this.save();
  },

  unfollow: function(userId) {
    if (this.following && this.following.length > 0) {
      this.following.remove(userId);
    }
    return this.save();
  },

  isFavorite: function(articleId) {
    return this.favorites.some(function(acticleId) {
      return articleId.toString() === articleId.toString();
    });
  },

  favorite: function(articleId) {
    if (this.favorites.indexOf(articleId) === -1) {
      this.favorites.push(articleId);
    }
    return this.save();
  },

  unfavorite: function(articleId) {
    this.favorites.remove(articleId);
    return this.save();
  }
};

export default mongoose.model("User", UserSchema);
