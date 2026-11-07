import mongoose, { isValidObjectId } from "mongoose";
import { Comment } from "../models/comment.model.js";
import { ApiError } from "../utils/ApiError.js";
import { ApiResponse } from "../utils/ApiResponse.js";
import { asyncHandler } from "../utils/asyncHandler.js";

const getVideoComments=asyncHandler(async(req,res)=>{
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }
    const comments = await Comment.aggregate([
        {
            $match:{
                video:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            $lookup:{
                from:"users",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1
                        }
                    }
                ]
            }
        },
        {
            $addFields:{
                owner:{
                    $first:"$owner"
                }
            }
        },
        {
            $sort:{
                createdAt:-1
            }
        }
    ]);
    return res
        .status(200)
        .json(new ApiResponse(200, comments, "Video comments fetched successfully"))
})

const addComment = asyncHandler(async(req, res)=>{
    const {videoId} = req.params;
    const {content} = req.body;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }
    if(!content?.trim()){
        throw new ApiError(400, "Comments cannot be empty");
    }
    const comment = await Comment.create({
        content,
        video:videoId,
        owner:req.user?._id
    });
    if(!comment){
        throw new ApiError(500,"Failed to add comment");
    }
    return res
        .status(201)
        .json(new ApiResponse(201,comment,"Comment added successfully"));
})

const updateComment = asyncHandler(async(req,res)=>{
    const {commentId} = req.params;
    const {content} = req.body;

    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID");
    }
    if(!content?.trim()){
        throw new ApiError(400, "Content cannot be empty");
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found");
    }
    if(comment.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403, "You do not have permission to edit this comment");
    }
    comment.content = content;
    const updatedComment = await comment.save({validateBeforeSave: false});
    return res
        .status(200)
        .json(new ApiResponse(200, updatedComment, "Comment updated successfully"));
})

const deleteComment = asyncHandler(async(req, res)=>{
    const {commentId} = req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400, "Invalid comment ID");
    }
    const comment = await Comment.findById(commentId);
    if(!comment){
        throw new ApiError(404, "Comment not found");
    }
    if (comment.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this comment");
    }
    await Comment.findByIdAndDelete(commentId);
    return res
        .status(200)
        .json(new ApiResponse(200,{},"Comment deleted successfully"));
})

export {
    getVideoComments,
    addComment,
    updateComment,
    deleteComment
};