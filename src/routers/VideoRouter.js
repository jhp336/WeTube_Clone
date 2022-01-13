import express from "express";
import { watch, getEdit, postEdit, getUpload, postUpload, deleteVideo } from "../controllers/VideoController";
import { protectorMiddleware, videoUpload} from "../middlewares";
const router = express.Router();

router.get('/:id([0-9a-f]{24})', watch);
router.route('/:id([0-9a-f]{24})/edit').all(protectorMiddleware).get(getEdit).post(postEdit);
router.get('/:id(\[0-9a-f]{24})/delete', protectorMiddleware, deleteVideo);
router.route('/upload').all(protectorMiddleware).get(getUpload).post(videoUpload.fields([
    {name:"video", maxCount:1}, {name:"thumb", maxCount:1}
]), postUpload);

export default router;