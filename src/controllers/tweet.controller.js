import {isValidObjectId} from "mongoose";
import {Tweet} from "../models/tweet.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const createTweet = asyncHandler(async(req,res)=>{
    const {content}=req.body;
    if(!content?.trim()){
        throw new ApiError(400, "Content cannot be empty");
    }
    const tweet = await Tweet.create({
        content,
        owner: req.user?._id
    });
    if(!tweet){
        throw new ApiError(500, "Failed to create tweet");
    }
    return res
        .status(201)
        .json(new ApiResponse(201, tweet, "Tweet created successfully"));
})
const getUserTweet = asyncHandler(async(req, res)=>{
    const {userId} = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID");
    }
    const tweets = (await Tweet.find({owner:userId})).sort({createdAt:-1});
    return res
        .status(200)
        .json(new ApiResponse(200, tweets, "User tweets fetched successfully"));
})
const updateTweet = asyncHandler(async(req,res)=>{
    const {tweetId} = req.params;
    const {content} = req.body;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID");
    }
    if(!content?.trim()){
        throw new ApiError(400, "Content cannot be empty");
    }
    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }
    if(tweet.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403, "You do not have permission to update this tweet");
    }
    tweet.content=content;
    const updatedTweet = await tweet.save({validateBeforeSave: false});
    return res
        .status(200)
        .json(new ApiResponse(200, updatedTweet, "Tweet updated successfully"))
})
const deleteTweet = asyncHandler(async(req, res)=>{
    const {tweetId} = req.params;
    if(!isValidObjectId(tweetId)){
        throw new ApiError(400, "Invalid tweet ID");
    }
    const tweet = await Tweet.findById(tweetId);
    if(!tweet){
        throw new ApiError(404, "Tweet not found");
    }
    if (tweet.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this tweet");
    }
    await Tweet.findByIdAndDelete(tweetId);
    return res
        .status(200)
        .json(new ApiResponse(200,{},"Tweet deleted successfully"));
})

export{
    createTweet,
    getUserTweet,
    updateTweet,
    deleteTweet
};