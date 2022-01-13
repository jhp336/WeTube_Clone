const video = document.querySelector("video");
const playBtn = document.getElementById("play");
const playBtnIcon = playBtn.querySelector("i");
const muteBtn = document.getElementById("mute");
const muteBtnIcon = muteBtn.querySelector("i");
const currnetTime = document.getElementById("currentTime");
const totalTime = document.getElementById("totalTime");
const volumeRange = document.getElementById("volume");
const timeline = document.getElementById("timeline");
const fullScreenBtn = document.getElementById("fullScreen");
const fullScreenBtnIcon = fullScreenBtn.querySelector("i");
const videoContainer = document.getElementById("videoContainer");
const videoControls = document.getElementById("videoControls");
const textarea = document.querySelector("textarea");

let controlsMovementTimeout = null;

let volumeVal = 0.5;
video.volume = volumeVal;

const handlePlay = function(){
    if(video.paused){
        video.play();
    }
    else{
        video.pause();
    }
    playBtnIcon.classList = video.paused ? "fas fa-play" : "fas fa-pause";
    handleMouseMove();
};
const handleMute = function(){
    if(video.muted){
        video.muted = false;
    }
    else{
        video.muted = true;
    }
    muteBtnIcon.classList = video.muted ? "fas fa-volume-mute" : "fas fa-volume-up";
    if(video.muted){
        volumeRange.value = 0;
    }
    else{
        volumeRange.value = volumeVal ? volumeVal : 0.5
    }
};

const handleVolumeChange = function(event){
    const { target: { value } } = event;
    volumeVal = Number(value);
    video.volume = value;

    if(value == 0){
        video.muted = true;
        muteBtnIcon.classList = "fas fa-volume-mute";
    }
    else if(video.muted){
        video.muted = false;
        muteBtnIcon.classList = "fas fa-volume-up";
    }
};

const formatTime = function(seconds){
    return new Date(seconds * 1000).toISOString().substring(11, 19);
};

const handleLoadedMetaData = function(){
    totalTime.innerText = formatTime(Math.floor(video.duration));
    timeline.max = Math.floor(video.duration);
};

const handleTimeUpdate = function(){
    currentTime.innerText = formatTime(Math.floor(video.currentTime));
    timeline.value = Math.floor(video.currentTime);
    if(video.currentTime === video.duration){
        playBtnIcon.classList = "fas fa-play";
    }

};

const handleTimelineChange = function(event){
    const { 
        target : {value}
    } = event;
    video.currentTime = value;
};

const handleFullScreenBtn = function(){
    if(document.fullscreenElement){
        document.exitFullscreen();
    }
    else {
        videoContainer.requestFullscreen();
    }
};

const handleFullScreen = function(){
    fullScreenBtnIcon.classList = document.fullscreenElement ? "fas fa-compress" : "fas fa-expand";
};

const hideControls = function(){
    videoControls.classList.remove("showing");
}
const handleMouseMove = function(){
    if(controlsMovementTimeout){
        clearTimeout(controlsMovementTimeout);
        controlsMovementTimeout = null;
    }
    videoControls.classList.add("showing");
    controlsMovementTimeout = setTimeout(hideControls,1500);
};

const handleKeydown = function(event){
    if(event.target != textarea){
        if(event.code === "Space"){
            event.preventDefault();
            handlePlay();
        }
        else if(event.code === "ArrowLeft"){
            event.preventDefault();
            video.currentTime -= 5;
            handleMouseMove();
        }
        else if(event.code === "ArrowRight"){
            event.preventDefault();
            video.currentTime += 5;
            handleMouseMove();
        }
        else if(event.code === "ArrowDown"){
            event.preventDefault();
            volumeRange.value = Number(volumeRange.value) - 0.1;
            if(volumeRange.value == 0){
                video.muted = true;
                muteBtnIcon.classList = "fas fa-volume-mute";
            }
            handleMouseMove();
        }
        else if(event.code === "ArrowUp"){
            event.preventDefault();
            volumeRange.value = Number(volumeRange.value) + 0.1;
            if(video.muted){
                video.muted = false;
                muteBtnIcon.classList = "fas fa-volume-up";
            }
            handleMouseMove();
        }
    }
};

const handleDblclick = function(event){
    console.log(event);
};

const handleEnded = function(){
    fetch(`/api/videos/${videoContainer.dataset.id}/view`, {
        method: "POST"
    });
};

playBtn.addEventListener("click", handlePlay);
muteBtn.addEventListener("click", handleMute);
volumeRange.addEventListener("input", handleVolumeChange);
video.addEventListener("loadedmetadata", handleLoadedMetaData);
video.addEventListener("timeupdate", handleTimeUpdate);
video.addEventListener("click", handlePlay);
video.addEventListener("dblclick", handleDblclick);
video.addEventListener("ended", handleEnded);
timeline.addEventListener("input", handleTimelineChange);
fullScreenBtn.addEventListener("click", handleFullScreenBtn);
videoContainer.addEventListener("fullscreenchange", handleFullScreen);
videoContainer.addEventListener("mousemove", handleMouseMove);
document.addEventListener("keydown", handleKeydown);