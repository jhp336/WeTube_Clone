import multer from "multer";
import multerS3 from "multer-s3"
import aws from "aws-sdk"

const S3 = new aws.S3({
    credentials:{
        accessKeyId:process.env.AWS_ID,
        secretAccessKey:process.env.AWS_SECRET
    }
});
const multerUpload = multerS3({
    s3:s3,
    bucket:"wetube-jhp"
});

export const localsMiddleware = function(req, res, next){
    res.locals.loggedIn = Boolean(req.session.loggedIn);
    res.locals.user = req.session.user || {};
    res.locals.siteName = "Wetube";
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
    storage:multerUpload
})
export const videoUpload = multer({
    dest:"uploads/videos/", 
    limits: {
        fileSize: 10000000
    },
    storage:multerUpload
})