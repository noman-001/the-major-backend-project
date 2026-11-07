import mongoose, {isValidObjectId} from "mongoose";
import {Video} from "../models/video.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const getVideoById = asyncHandler(async(req, res)=>{
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }
    // increase view count
    await Video.findByIdAndUpdate(videoId,{
        $inc:{views:1}
    });

    const video = await Video.aggregate([
        {
            $match:{
                _id:new mongoose.Types.ObjectId(videoId)
            }
        },
        {
            // join video owner profile
            $lookup:{
                from:"user",
                localField:"owner",
                foreignField:"_id",
                as:"owner",
                pipeline:[
                    {
                        // count subscribers of this creator
                        $lookup:{
                            from:"subscriptions",
                            localField:"_id",
                            foreignField:"channel",
                            as:"subscribers"
                        }
                    },
                    {
                        $addFields:{
                            subscribersCount:{$size:"$subscribers"},
                            isSubscribed:{
                                $cond:{
                                    if:{$in:[req.user?._id, "$subscribers.subscriber"]},
                                    then:true,
                                    else:false
                                }
                            }
                        }
                    },
                    {
                        $project:{
                            fullName:1,
                            username:1,
                            avatar:1,
                            subscribersCount:1,
                            isSubscribed:1
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
    ]);
    if(!video?.length){
        throw new ApiError(404, "Video not found");
    }
    const videoData=video[0];
    if(!videoData.isPublished && videoData.owner?._id.toString()!==req.user?._id.toString()){
        throw new ApiError(403, "This video is Private");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, videoData, "Video fetched successfully"));
})

const togglePublishStatus = asyncHandler(async(req, res)=>{
    const {videoId} = req.params;
    if(!isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid video ID");
    }
    const video = await Video.findById(videoId);
    if(!video){
        throw new ApiError(404, "Video not found");
    }
    if(video.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403, "You do not have permission to modify this video");
    }
    video.isPublished = !video.isPublished;
    await video.save({validateBeforeSave: false});

    return res
        .status(200)
        .json(
            new ApiResponse(
                200,
                {isPublished:video.isPublished},
                `Video ${video.isPublished?"published":"unpublished"} successfully`
            )
        );
})

export {
    getVideoById,
    togglePublishStatus
}