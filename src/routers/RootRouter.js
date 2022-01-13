import express from "express";
import { home, search } from "../controllers/VideoController";
import { getJoin, postJoin, getLogin, postLogin } from "../controllers/UserController";
import { publicOnlyMiddleware } from "../middlewares";
const router = express.Router();

router.get('/', home);
router.route('/join').all(publicOnlyMiddleware).get(getJoin).post(postJoin);
router.route('/login').all(publicOnlyMiddleware).get(getLogin).post(postLogin);
router.get('/search', search);

export default router;