import mongoose from "mongoose"

const replySchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 5000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
  },
  {
    timestamps: true,
  },
)

replySchema.add({
  replies: [replySchema],
})

const commentSchema = new mongoose.Schema(
  {
    text: {
      type: String,
      required: true,
      minlength: 1,
      maxlength: 5000,
    },
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    blog: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Blog",
      required: true,
    },
    replies: [replySchema],
  },
  {
    timestamps: true,
  },
)

const Comment = mongoose.model("Comment", commentSchema)
export default Comment
