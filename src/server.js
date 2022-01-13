import express from "express";
import morgan from "morgan";
import session from "express-session";
import MongoStore from "connect-mongo";
import flash from "express-flash";
import RootRouter from "./routers/RootRouter";
import UserRouter from "./routers/UserRouter";
import VideoRouter from "./routers/VideoRouter";
import apiRouter from "./routers/apiRouter";
import { localsMiddleware } from "./middlewares";

const app = express();
const logger = morgan('dev');

app.set('view engine', 'pug');
app.set('views', process.cwd() + '/src/views');
app.use((req, res, next) => {
    res.header("Cross-Origin-Resource-Policy", "cross-origin");
    res.header("Cross-Origin-Embedder-Policy", "require-corp");
    res.header("Cross-Origin-Opener-Policy", "same-origin");
    next();
});
app.use(logger);
app.use(express.urlencoded({extended:true}));
app.use(express.json());
app.use(
    session({
        secret:process.env.COOKIE_SECRET,
        resave:false,
        saveUninitialized:false,
        store: MongoStore.create({mongoUrl: process.env.DB_URL})
    })
);
app.use(flash());
app.use(localsMiddleware);
app.use('/uploads', express.static('uploads'));
app.use('/static', express.static('assets'), express.static('node_modules/@ffmpeg/core/dist'));
app.use('/', RootRouter);
app.use('/users', UserRouter);
app.use('/video', VideoRouter);
app.use('/api', apiRouter);

export default app;