import express from "express";
import { getEdit, postEdit, logout, see, startGithubLogin, finishGithubLogin, getChangePw, postChangePw } from "../controllers/UserController"
import { protectorMiddleware, publicOnlyMiddleware, avatarUpload } from "../middlewares";
const router = express.Router();

router.get('/logout', protectorMiddleware, logout);
router.route('/edit').all(protectorMiddleware)
.get(getEdit)
.post(avatarUpload.single("avatar"),postEdit);
router.route('/change-password').all(protectorMiddleware).get(getChangePw).post(postChangePw);
router.get('/github/start',publicOnlyMiddleware, startGithubLogin);
router.get('/github/finish', publicOnlyMiddleware, finishGithubLogin);
router.get('/:id([0-9a-f]{24})', see);

export default router;