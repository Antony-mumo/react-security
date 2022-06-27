var mongoose = require("mongoose");

var CommentSchema = new mongoose.Schema(
  {
    body: String,
    author: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
    article: { type: mongoose.Schema.Types.ObjectId, ref: "Article" }
  },
  { timestamps: true }
);

CommentSchema.methods = {
  getCommentPacket: function(user) {
    return {
      id: this.id,
      body: this.body,
      createdAt: this.createdAt,
      author: this.author.getAuthorPacket(user)
    };
  }
};

export default mongoose.model("Comment", CommentSchema);
