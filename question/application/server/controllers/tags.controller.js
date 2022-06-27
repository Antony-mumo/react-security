import mongoose from "mongoose";
import Article from "../models/article.model";

const tags = (req, resp, next) => {
  Article.find()
    .distinct("tagList")
    .then(tags => {
      // if (!tags || tags.length === 0) tags = ["tag_1", "tag_2"]; //to test UI
      return resp.status(200).json({ tags });
    })
    .catch(next);
};

export default {
  tags
};
