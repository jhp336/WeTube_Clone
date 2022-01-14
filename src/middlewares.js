import multer from "multer";
import multerS3 from "multer-s3"
import aws from "aws-sdk"

const isHeroku = process.env.NODE_ENV === "production";

const S3 = new aws.S3({
    credentials:{
        accessKeyId:process.env.AWS_ID,
        secretAccessKey:process.env.AWS_SECRET
    }
});
const s3ImgageUpload = multerS3({
    s3:S3,
    bucket:"wetube-jhp/images",
    acl:"public-read"
});

const s3VideoUpload = multerS3({
    s3:S3,
    bucket:"wetube-jhp/videos",
    acl:"public-read"
});

export const localsMiddleware = function(req, res, next){
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.user = req.session.user || {};
    res.locals.siteName = "Wetube";
    res.locals.isHeroku = isHeroku;
    next();
}

export const protectorMiddleware = function(req,res,next) {
    if(req.session.loggedIn){
        next();
    }
    else {
        req.flash("error", "Login First");
        res.redirect('/login');
    }
}

export const publicOnlyMiddleware = function(req,res,next){
    if(!req.session.loggedIn){
        next();
    }
    else {
        req.flash("error", "Not authorized");
        res.redirect('/');
    }
}

export const avatarUpload = multer({
    dest:"uploads/avatars/", 
    limits: {
        fileSize: 3000000
    },
    storage: isHeroku ? s3ImgageUpload : undefined
})
export const videoUpload = multer({
    dest:"uploads/videos/", 
    limits: {
        fileSize: 10000000
    },
    storage: isHeroku ? s3VideoUpload : undefined
})