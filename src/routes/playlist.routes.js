import {Router} from "express";
import{
    createPlaylist,
    getUserPlaylists,
    getPlaylistById,
    addVideoToPlaylist,
    removeVideoFromPlaylist,
    updatePlaylist,
    deletePlaylist,
} from "../controllers/playlist.controller.js";
import {verifyJWT} from "../middlewares/auth.middleware.js";

const router = Router();
router.post("/", verifyJWT, createPlaylist);
router.get("/user/:userId", verifyJWT, getUserPlaylists);
router.get("/:playlistId", verifyJWT, getPlaylistById);
router.patch("/:playlistId", verifyJWT, updatePlaylist);
router.delete("/:playlistId", verifyJWT, deletePlaylist);
router.patch("/add/:videoId/:playlistId", verifyJWT, addVideoToPlaylist);
router.patch("/remove/:videoId/:playlistId", verifyJWT, removeVideoFromPlaylist);

export default router