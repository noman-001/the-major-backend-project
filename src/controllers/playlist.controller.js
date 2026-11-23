import mongoose, {isValidObjectId} from "mongoose";
import {Playlist} from "../models/playlist.model.js";
import {ApiError} from "../utils/ApiError.js";
import {ApiResponse} from "../utils/ApiResponse.js";
import {asyncHandler} from "../utils/asyncHandler.js";

const createPlaylist = asyncHandler(async(req, res)=>{
    const {name, description} = req.body;
    if(!name?.trim() || !description?.trim()){
        throw new ApiError(400, "Name and description are required");
    }
    const playlist = await Playlist.create({
        name,
        description,
        owner:req.user?._id
    });
    if(!playlist){
        throw new ApiError(500, "Failed to create a playlist");
    }
    return res
        .status(201)
        .json(new ApiResponse(201, playlist, "Playlist created successfully"));
})
const getUserPlaylists = asyncHandler(async(req, res)=>{
    const {userId} = req.params;
    if(!isValidObjectId(userId)){
        throw new ApiError(400, "Invalid user ID");
    }
    const playlists = await Playlist.aggregate([
        {
            $match:{
                owner: new mongoose.Types.ObjectId(userId)
            }
        },
        {
            $addField:{
                totalVideos:{$size:"$videos"}
            }
        }
    ]);
    return res
        .status(200)
        .json(new ApiResponse(200,playlists,"User playlists fetched successfully"));
})
const getPlaylistById = asyncHandler(async(req, res)=>{
    const {playlistId} = req.params;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.aggregate([
        {
            $match:{
                _id: new mongoose.Types.ObjectId(playlistId)
            }
        },
        {
            $lookup:{
                from:"videos",
                localField:"videos",
                foreignField:"_id",
                as:"videos",
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
                                        fullname:1,
                                        username:1,
                                        avatar:1
                                    }
                                }
                            ]
                        }
                    },
                    {
                        $addField:{
                            owner:{
                                $first:"$owner"
                            }
                        }
                    }
                ]
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
            $addField:{
                owner:{$first:"$owner"},
                totalVideos:{$size:"$videos"}
            }
        }
    ]);
    if(!playlist?.length){
        throw new ApiError(404, "Playlist not found");
    }
    return res
        .status(200)
        .json(new ApiResponse(200, playlist[0],"Playlist fetched successfully"));
})
const addVideoToPlaylist = asyncHandler(async(req, res)=>{
    const {playlistId, videoId} = req.params;
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist ID or video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    if(playlist.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403, "You do not ave the permission to modify this playlist");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $addToSet:{
                videos:videoId
            }
        },
        {new:true}
    );
    return res
        .status(200)
        .json(new ApiResponse(200,updatedPlaylist,"Video added to the playlist successfully"));
})
const removeVideoFromPlaylist = asyncHandler(async(req, res)=>{
    const {playlistId, videoId} = req.params;
    if(!isValidObjectId(playlistId) || !isValidObjectId(videoId)){
        throw new ApiError(400, "Invalid playlist ID or video ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    if(playlist.owner.toString()!==req.user?._id.toString()){
        throw new ApiError(403, "You do not ave the permission to modify this playlist");
    }
    const updatedPlaylist = await Playlist.findByIdAndUpdate(
        playlistId,
        {
            $pull:{
                videos:videoId
            }
        },
        {new:true}
    );
    return res
        .status(200)
        .json(new ApiResponse(200,updatedPlaylist,"Video removed from the playlist successfully"));
})
const updatePlaylist = asyncHandler(async(req, res)=>{
    const {playlistId} = req.params;
    const { name, description } = req.body;
    if (!isValidObjectId(playlistId)) {
        throw new ApiError(400, "Invalid playlist ID");
    }
    if(!name?.trim() && !description?.trim()){
        throw new ApiError(400,"Atleast name or description is required to update");
    }
    const playlist = await Playlist.findById(playlistId);
    if (!playlist) {
        throw new ApiError(404, "Playlist not found");
    }
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to update this playlist");
    }
    if(name?.trim()){
        playlist.name=name;
    }
    if(description?.trim()){
        playlist.description=description;
    }
    const updatedPlaylist = await playlist.save({validateBeforeSave: false})
    return res
        .status(200)
        .json(new ApiResponse(200, updatedPlaylist, "Playlist updated successfully"));
})
const deletePlaylist = asyncHandler(async(req, res)=>{
    const {playlistId} = req.params;
    if(!isValidObjectId(playlistId)){
        throw new ApiError(400, "Invalid playlist ID");
    }
    const playlist = await Playlist.findById(playlistId);
    if(!playlist){
        throw new ApiError(404, "Playlist not found");
    }
    if (playlist.owner.toString() !== req.user?._id.toString()) {
        throw new ApiError(403, "You do not have permission to delete this playlist");
    }
    await Playlist.findByIdAndDelete(playlistId);
    return res
        .status(200)
        .json(new ApiResponse(200, {}, "Playlist deleted successfully"));
})

export{
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
}