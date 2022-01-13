import Video from "../models/Video";
import User from "../models/User";
import Comment from "../models/Comment";

export const home = async function(req,res){
    const videos = await Video.find({}).sort({createdAt:"desc"}).populate("owner");
    res.render("videos/home", { pageTitle: "Home", videos });
};
export const watch = async function(req,res){
    const id = req.params.id;
    const video = await Video.findById(id).populate("owner").populate("comments");
    if(!video){
        return res.status(404).render("404", { pageTitle: "Video Not Found."});
    }
    res.render("videos/watch", { pageTitle: video.title, video });
};
export const getEdit = async function(req,res){
    const id = req.params.id;
    const {
        user: {_id} 
    } = req.session;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", { pageTitle: "Video Not Found."});
    }
    if(String(video.owner) !== String(_id)){
        req.flash("error", "권한이 없습니다.");
        return res.status(403).redirect("/");
    }
    res.render("videos/edit", { pageTitle: `Edit: ${video.title}`, video});
};
export const postEdit = async function(req,res){
    const id = req.params.id;
    const {title, description, hashtags} = req.body;
    const {
        user: {_id} 
    } = req.session;
    const video = await Video.findById(id);
    if(!video){
        return res.status(404).render("404", { pageTitle: "Video Not Found."});
    }
    if(String(video.owner) !== String(_id)){
        req.flash("error", "권한이 없습니다.");
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndUpdate(id,{
        title, description,
        hashtags: Video.formatHashtags(hashtags)
    })
    res.redirect(`/video/${id}`)
};
export const getUpload = function(req,res){
    res.render("videos/upload", { pageTitle: 'Upload Video'});
};
export const postUpload = async function(req,res){
    const {
        user:{_id}
    } = req.session;  // const {_id} = req.session.user; 
    const { title, description, hashtags } = req.body;
    const {video, thumb} = req.files;
    try{
        const newVideo = await Video.create({
            title:title,
            description,
            fileUrl:video[0].path,
            thumbUrl:thumb[0].path.replace(/\\/g, "/"),
            hashtags:Video.formatHashtags(hashtags),
            owner: _id
        });
        const user = await User.findById(_id);
        user.videos.push(newVideo._id);
        user.save();
        req.flash("info", "Upload 완료");
        res.redirect("/");
    } catch(error){
        req.flash("error", error._message);
        res.status(400).render("videos/upload", { 
            pageTitle: 'Upload Video'
        });
    }
    
};
export const deleteVideo = async function(req,res){
    const {
        user: {_id} 
    } = req.session;
    const {id} = req.params;
    const video = await Video.findById(id);
    const user = await User.findById(_id);
    if(!video){
        return res.status(404).render("404", { pageTitle: "Video Not Found."});
    }
    if(String(video.owner) !== String(_id)){
        return res.status(403).redirect("/");
    }
    await Video.findByIdAndDelete(id);
    user.videos.splice(user.videos.indexOf(id),1);
    user.save();
    req.flash("info", "삭제 완료");
    res.redirect("/");
};

export const search = async function(req,res){
    const keyword = req.query.keyword;
    let videos = [];
    if(keyword){
        videos = await Video.find({
            title: {
                $regex: new RegExp(keyword, "i")
            }
        }).populate("owner");
    }
    res.render("videos/search", { pageTitle: "Search", videos});
};

export const registerView = async function(req,res){
    const {id} = req.params;
    const video = await Video.findById(id);
    if(!video){
        res.sendStatus(404);
    }
    else{
        video.meta.views += 1;
        await video.save();
        res.sendStatus(200);
    }
};

export const createComment = async function(req,res){
    const {
        params: { id },
        session: { user },
        body: { text }
    } = req;
    const video = await Video.findById(id);
    if(!video){
        res.sendStatus(404);
    }
    else{
        const comment = await Comment.create({
            text, 
            owner: user._id,
            video: id
        });
        video.comments.push(comment._id);
        video.save();
        const owner_user = await User.findById(user._id)
        owner_user.comments.push(comment._id);
        owner_user.save();
        

        res.status(201).json({newCommentId:comment._id});
    }
};

export const deleteComment = async function(req, res){
    const { 
        params: {id},
        session: {user}
    } = req;
    const comment = await Comment.findById(id);
    console.log(comment);
    if(String(comment.owner) !== String(user._id)){
        req.flash("error", "권한이 없습니다.");
        res.sendStatus(400);
    }
    else{
        const { owner, video } = comment;
        await Comment.findByIdAndDelete(id);

        const commentOwner = await User.findById(String(owner));
        commentOwner.comments.splice(commentOwner.comments.indexOf(id),1);
        commentOwner.save();

        const commentVideo = await Video.findById(String(video));
        commentVideo.comments.splice(commentVideo.comments.indexOf(id),1);
        commentVideo.save();

        res.sendStatus(200);
    }
};
