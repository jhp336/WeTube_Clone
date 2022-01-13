import bcrypt from "bcrypt"
import fetch from "node-fetch"
import User from "../models/User"

export const getJoin = function(req,res){
    res.render("users/join", { pageTitle: "회원가입" });
};
export const postJoin = async function(req,res){
    const {name, email, username, password, password2, location} = req.body;
    if(password != password2){
        req.flash("error", "비밀번호 확인이 일치하지 않습니다.");
        return res.status(400).render("users/join", { 
            pageTitle: "회원가입"
        }); 
    }
    const usernameExists = await User.exists( { username } );
    if(usernameExists){
        req.flash("error", "이미 사용중인 username 입니다.");
        return res.status(400).render("users/join", { 
            pageTitle: "회원가입"
        }); 
    }
    const emailExists = await User.exists( { email } );
    if(emailExists){
        req.flash("error", "이미 사용중인 이메일 주소 입니다.");
        return res.status(400).render("users/join", { 
            pageTitle: "회원가입"
        }); 
    }
    try{
        await User.create({
            name,
            email,
            username,
            password,
            location
        });
        res.redirect("/login");
    } catch(error){
        req.flash("error", error._message);
        res.status(400).render("users/join", { 
            pageTitle: "회원가입"
        });
    }
};

export const getLogin = function(req,res){
    const {host, referer} = req.headers;
    if(String(referer).indexOf(host + "/video/") !== -1){
        req.session.referer = referer;
    }
    else {
        req.session.referer = null;
    }
    res.render("users/login", { pageTitle: "로그인" });
};
export const postLogin = async function(req,res){
    const {username, password} = req.body;
    const user = await User.findOne({username, socialOnly:false});
    if (!user){
        req.flash("error", "해당 계정이 존재하지 않습니다.");
        return res.status(400).render("users/login", { 
            pageTitle: "로그인" 
        });
    }
    const ok = await bcrypt.compare(password, user.password);
    if(!ok){
        req.flash("error", "비밀번호가 일치하지 않습니다.");
        return res.status(400).render("users/login", { 
            pageTitle: "로그인" 
        });
    }
    req.session.loggedIn = true;
    req.session.user = user;
    if(req.session.referer !== null){
        res.redirect(req.session.referer);
        req.session.referer = null;
    }
    else res.redirect("/");
};
export const startGithubLogin = function(req,res){
    const baseUrl = "https://github.com/login/oauth/authorize";
    const config ={
        client_id:process.env.GH_CLIENT,
        allow_signup:false,
        scope:"read:user user:email"
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    res.redirect(finalUrl);
};
export const finishGithubLogin = async function(req,res){
    const baseUrl = "https://github.com/login/oauth/access_token";
    const config = {
        client_id:process.env.GH_CLIENT,
        client_secret:process.env.GH_SECRET,
        code:req.query.code
    }
    const params = new URLSearchParams(config).toString();
    const finalUrl = `${baseUrl}?${params}`;
    const tokenRequest = await(
        await fetch(finalUrl,{
            method:"POST",
            headers:{
                Accept:"application/json"
            }
        })
    ).json();
    if("access_token" in tokenRequest){
        const {access_token} = tokenRequest;
        const apiUrl = "https://api.github.com";
        const userData = await(
            await fetch(`${apiUrl}/user`,{
                headers:{
                    Authorization: `token ${access_token}`
                }        
            })
        ).json();
        const emailData = await(
            await fetch(`${apiUrl}/user/emails`,{
                headers:{
                    Authorization: `token ${access_token}`
                }  
            })
        ).json();
        const emailObject = emailData.find(function(email){
            return email.primary === true && email.verified === true ;
        });// (email)=>email.primary === true && email.verified == true ;
        if(!emailObject){
            return res.redirect("/login");
        }
        let user = await User.findOne({email:emailObject.email});
        if(!user){
            user = await User.create({
                name:userData.name ? userData.name : userData.login,
                email:emailObject.email,
                username:userData.login,
                password:"",
                location:userData.location,
                socialOnly:true,
                avatarUrl:userData.avatar_url
            });
        }
        req.session.loggedIn = true;
        req.session.user = user;
        if(req.session.referer !== null){
            res.redirect(req.session.referer);
            req.session.referer = null;
        }
        else res.redirect("/");
    }
    else{
        res.redirect("/login");
    }
}
export const logout = function(req,res){
    req.session.destroy();
    res.redirect("/");
};
export const getEdit = function(req,res){
    res.render("users/edit-profile", { pageTitle : "회원 정보 수정" });
};
export const postEdit = async function(req,res){
    /*const {
        session:{
            user:{_id}
        },
        body: {email, username, name, location}
    }=req;*/
    const { _id, avatarUrl } = req.session.user;
    const { email, username, name, location } = req.body;
    const file = req.file;
    if(username != req.session.user.username){
        const usernameExists = await User.exists( { username } );
        if(usernameExists){
            req.flash("error", "이미 사용중인 username 입니다.");
            return res.status(400).render("users/edit-profile", { 
                pageTitle: "회원 정보 수정",
                formData : {
                    email, username, name, location
                }
            }); 
        }
    }
    if(email != req.session.user.email){
        const emailExists = await User.exists( { email } );
        if(emailExists){
            req.flash("error", "이미 사용중인 이메일 주소 입니다.");
            return res.status(400).render("users/edit-profile", { 
                pageTitle: "회원 정보 수정",
                formData : {
                    email, username, name, location
                }
            }); 
        }
    }
    const updatedUser = await User.findByIdAndUpdate(_id, {
        avatarUrl: file ? file.location : avatarUrl ,        
        email, username, name, location
    }, 
    {new: true});
    req.session.user = updatedUser;
    res.redirect("/users/edit");
};
export const getChangePw = function(req,res){
    res.render("users/change-password", {pageTitle: "비밀번호 변경"});
};
export const postChangePw = async function(req,res){
    const { _id, password } = req.session.user;
    const { oldpw, newpw, newpw2 } = req.body;
    if(newpw!=newpw2){
        req.flash("error", "새 비밀번호 확인 불일치!");
        return res.status(400).render("users/change-password", {
            pageTitle: "비밀번호 변경"
        });
    }
    const ok = await bcrypt.compare(oldpw, password);
    if(!ok){
        req.flash("error", "현재 비밀번호가 일치하지 않습니다.");
        return res.status(400).render("users/change-password", { 
            pageTitle: "비밀번호 변경"
        });
    }
    const user = await User.findById(_id);
    user.password = newpw;
    await user.save();
    res.redirect("/users/logout");
};

export const see = async function(req,res){
    const {id} = req.params;
    const user_see = await User.findById(id).populate({
        path: "videos",
        populate: {
          path: "owner",
          model: "User",
        }
      });
    if(!user_see)
    return res.status(404).render("404", {
        pageTitle:"User Not Found."
    });
    res.render("users/profile",{pageTitle: `${user_see.name}의 Profile`, user_see});
};
export const remove = function(req,res){
    res.send("remove user");
};