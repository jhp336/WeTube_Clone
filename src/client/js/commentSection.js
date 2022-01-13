
const form = document.getElementById("commentForm");
const textarea = form.querySelector("textarea");
const videoContainer = document.getElementById("videoContainer");
const deleteBtn = document.querySelectorAll(".comment__delete");

const addComment = function(text, id){
    const videoComments = document.querySelector(".video__comments ul");
    const newComment = document.createElement("li");
    const icon = document.createElement("i");
    const span = document.createElement("span");
    const span2 = document.createElement("span");
    newComment.classList = "video__comment";
    newComment.dataset.id = id;
    icon.classList = "fas fa-comment";
    span.innerText = ` ${text}`;
    span2.innerText = "❌";
    span2.classList = "comment__delete";
    newComment.appendChild(icon);
    newComment.appendChild(span);
    newComment.appendChild(span2);
    span2.addEventListener("click", handleDelete);
    videoComments.prepend(newComment);

    const emptymsg = document.querySelector(".empty__message");
    if(emptymsg){
        videoComments.removeChild(emptymsg);
    }
}

const handlesubmit = async function(event){
    event.preventDefault();
    const text = textarea.value;
    const videoId = videoContainer.dataset.id;
    if(text === ""){
        return;   
    }
    
    const response = await fetch(`/api/videos/${videoId}/comment`, {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            text
        })
    });
    
    if(response.status === 201){
        textarea.value = "";
        const {newCommentId} = await response.json();
        addComment(text, newCommentId);
    }
};

const handleIsLogined = function(){
    if(textarea.classList[0]==="not-login"){
        const a = document.createElement("a");
        a.href = "/login";
        a.click();
    }
};


const handleDelete = async function(event){
    const commentId = event.target.parentElement.dataset.id;
    const response = await fetch(`/api/comments/${commentId}`, {
        method: "DELETE"
    });

    if(response.status === 200){
        console.log("yes");
        event.target.parentElement.remove();
        const videoComments = document.querySelector(".video__comments ul");
        if(videoComments.querySelectorAll("li").length === 0){
            const span = document.createElement("span");
            span.classList = "empty__message";
            span.innerText = "No Comment yet."
            videoComments.appendChild(span);
        }
    }
}

form.addEventListener("submit", handlesubmit);
textarea.addEventListener("click", handleIsLogined);
deleteBtn.forEach(function(cmnt){
    cmnt.addEventListener("click", handleDelete);
});

