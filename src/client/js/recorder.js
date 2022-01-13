import { createFFmpeg, fetchFile } from "@ffmpeg/ffmpeg";
const recordBtn = document.getElementById("recordBtn");
const againBtn = document.getElementById("againBtn");
const video = document.getElementById("preview");

let stream;
let recorder;
let videoFile;

againBtn.disabled = true;
againBtn.hidden = true;
video.hidden = true;


const files = {
    input: "recording.mp4",
    //output: "output.mp4",
    thumb: "thumbnail.jpg"
};

const downloadFile = function(fileUrl, fileName){
    const a = document.createElement("a");
    a.href = fileUrl;
    a.download = fileName;
    document.body.appendChild(a);
    a.click();
};

const handleStart = function(){
    recordBtn.innerText = "Recording...";
    recordBtn.disabled = true;
    recordBtn.removeEventListener("click", handleStart);

    recorder = new MediaRecorder(stream);
    recorder.ondataavailable = function(event){
        videoFile = URL.createObjectURL(event.data);
        video.srcObject = null;
        video.src = videoFile;
        video.loop = true;
        video.play();
        
        recordBtn.innerText = "Download";
        recordBtn.disabled = false;
        recordBtn.addEventListener("click", handleDownload);
    }
    recorder.start();
    setTimeout(() => {
        recorder.stop();
        againBtn.disabled = false;
        againBtn.hidden = false;
    }, 3000);
};

const handleDownload = async function(){
    recordBtn.innerText = "Downloading...";
    recordBtn.removeEventListener("click", handleDownload);
    recordBtn.disabled = true;
    againBtn.disabled = true;
    againBtn.hidden = true;

    const ffmpeg = createFFmpeg({
        corePath: "/static/ffmpeg-core.js"
    });
    await ffmpeg.load();

    ffmpeg.FS("writeFile", files.input, await fetchFile(videoFile));
    //await ffmpeg.run("-i", files.input, "-r", "60", files.output);

    await ffmpeg.run("-i", files.input, "-ss", "00:00:01", "-frames:v", "1", files.thumb);

    //const mp4File = ffmpeg.FS("readFile", files.output);
    const thumbFile = ffmpeg.FS("readFile", files.thumb);

    //const mp4Blob = new Blob([mp4File.buffer], {type: "video/mp4"});
    const thumbBlob = new Blob([thumbFile.buffer], {type: "image/jpg"});

    //const mp4Url = URL.createObjectURL(mp4Blob);
    const thumbUrl = URL.createObjectURL(thumbBlob);

    downloadFile(videoFile, "MyRecording.mp4");
    downloadFile(thumbUrl, "MyThumbnail.jpg");

    ffmpeg.FS("unlink", files.input);
    //ffmpeg.FS("unlink", files.output);
    ffmpeg.FS("unlink", files.thumb);

    URL.revokeObjectURL(videoFile);
    //URL.revokeObjectURL(mp4Url);
    URL.revokeObjectURL(thumbUrl);

    recordBtn.disabled = false;
    recordBtn.innerText = "Recording Again";
    recordBtn.addEventListener("click", handleUse);
    const tracks = stream.getTracks();
    tracks.forEach((track) => {
        track.stop();
    });
    stream = null;
    video.src = null;
    video.hidden = true;
};

const handleRestart = function(){
    againBtn.disabled = true;
    againBtn.hidden = true;
    recordBtn.removeEventListener("click", handleDownload);
    video.src = null;
    video.srcObject = stream;
    video.play();
    handleStart();
};

const handleUse = function(){
    init();
    recordBtn.innerText = "Start Recording";
    recordBtn.removeEventListener("click", handleUse);
    recordBtn.addEventListener("click", handleStart);
};


const init = async function(){
    video.hidden = false;
    stream = await navigator.mediaDevices.getUserMedia({
        audio: false,
        video: {
            width:1024,
            height:576
        }
    });
    video.srcObject = stream;
    video.play();
};

recordBtn.addEventListener("click", handleUse);
againBtn.addEventListener("click", handleRestart);