import {isValidObjectId} from "mongoose";
import {Like} from "../models/like.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const toggleVideoLike = asyncHandler(async(req, res)=>{
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }
    const likeCriteria={
        video: videoId,
        likedBy: req.user?._id
    };
    const alreadyLiked = await Like.findOne(likeCriteria);
    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked._id);
        return res
            .status(200)
            .json(new ApiResponse(200,{isLiked:false}, "Video unlike successfull"))
    }
    await Like.create(likeCriteria);
    return res
        .status(200)
        .json(new ApiResponse(200, {isLiked:true}, "Video liked successfully"))
})

const toggleCommentLike = asyncHandler(async(req, res)=>{
    const { commentId } = req.params;
    if(!isValidObjectId(commentId)){
        throw new ApiError(400,"Invalid comment ID");
    }
    const likeCriteria = {
        comment:commentId,
        likedBy:req.user?._id
    };
    const alreadyLiked = await Like.findOne(likeCriteria);
    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked._id);
        return res
            .status(200)
            .json(new ApiResponse(200, {isLiked:false},"Comment unliked successfully"))
    }
    await Like.create(likeCriteria);
    return res
        .status(200)
        .json(new ApiResponse(200,{isLiked:true},"Comment liked successfully"));
})

const toggleTweetLike = asyncHandler(async(req, res)=>{
    const { tweetId } = req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400,"Invalid tweet ID");
    }
    const likeCriteria = {
        tweet:tweetId,
        likedBy:req.user?._id
    };
    const alreadyLiked = await Like.findOne(likeCriteria);
    if(alreadyLiked){
        await Like.findByIdAndDelete(alreadyLiked._id);
        return res
            .status(200)
            .json(new ApiResponse(200, {isLiked:false},"Tweet unliked successfully"))
    }
    await Like.create(likeCriteria);
    return res
        .status(200)
        .json(new ApiResponse(200,{isLiked:true},"Tweet liked successfully"));
})

const getLikedVideos = asyncHandler(async(req, res)=>{
    const likedVideos = await Like.aggregate([
        {
            $match:{
                likedBy:req.user?._id,
                video:{$exists:true}
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"video",
                foreignField:"_id",
                as: "video",
                pipeline:[
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
                            owner:{$first:"$owner"}
                        }
                    }
                ]
            }
        },
        {
            $unwind:"$video"
        },
        {
            $sort:{
                createdAt:-1
            }
        },
        {
            $project:{
                _id:1,
                video:1
            }
        }
    ]);
    return res
        .status(200)
        .json(new ApiResponse(200,likedVideos,"Liked videos fetched successfully"));
})

export{
    toggleCommentLike,
    toggleTweetLike,
    toggleVideoLike,
    getLikedVideos
}
