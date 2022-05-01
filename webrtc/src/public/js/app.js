// const socket = new WebSocket(`ws://${window.location.host}`);
// socket.addEventListener("open", ()=> {
//     console.log("Connec");
// });
// socket.addEventListener("message",(msg) => {
//     console.log("New Msg: ", msg);
// });
// socket.addEventListener("close", () => {
//     console.log("discon");
// });
// setTimeout(() => {
//     socket.send("hello device");
// }, 1000);
const socket = io();

const myFace = document.getElementById("myFace");
const muteBtn = document.getElementById("mute");
const cameraBtn = document.getElementById("camera");
const camerasSelect = document.getElementById("cameras");

const welcome = document.getElementById("welcome");
const call = document.getElementById("call");

call.hidden=true;

let myStream;
let muted = false;
let cameraOff = false;
let roomName;
let myPeerConnection;
let myDataChannel;

async function getCameras() {
    try{
        const devices = await navigator.mediaDevices.enumerateDevices();
        const cameras = devices.filter(device => device.kind === "videoinput");
        cameras.forEach(camera => {
            const option = document.createElement("option");
            option.value = camera.deviceId;
            option.innerText = camera.label;
            camerasSelect.appendChild(option);
        })
    }catch (e) {console.log(e)}
}

async function getMedia(deviceId) {
    const initialConstrains = {
        audio: true,
        video: { facingMode: "user" },
    };
    const cameraConstraints = {
        audio: true,
        video: { deviceId: { exact: deviceId } },
    };
    try {
        myStream = await navigator.mediaDevices.getUserMedia(
            deviceId ? cameraConstraints : initialConstrains
        );
        myFace.srcObject = myStream;
        if (!deviceId) {
            await getCameras();
        }
    } catch (e) {
        console.log(e);
    }
}

const handleMuteBtn = () => {
    myStream.getAudioTracks().forEach((track) => (track.enabled = !track.enabled))
    if(!muted) {
        muteBtn.innderText = "Unmute";
    } else {
        muteBtn.innerText = "Mute";
    }
}
const handleCameraBtn = () => {
    myStream.getVideoTracks().forEach((track) => (track.enabled = !track.enabled ))
    if(cameraOff) {
        cameraBtn.innerText = "Turn Camera Off";
        cameraOff = false;
    } else{
        cameraBtn.innerText = "Turn Camera On";
        cameraOff = true;
    }
}

handleCameraChange = async () => {
    await getMedia(camerasSelect.value);
    if(myPeerConnection){
        const videoTrack = myStream.getVideoTracks()[0]
        const videoSender = myPeerConnection.getSenders().find(sender => sender.track.kind === "video");
        videoSender.replaceTrack(videoTrack);
    }

}


muteBtn.addEventListener("click", handleMuteBtn);
cameraBtn.addEventListener("click", handleCameraBtn);
camerasSelect.addEventListener("input", handleCameraChange);

const welcomeForm = welcome.querySelector("form");


initCall = async  () => {
    welcome.hidden = true;
    call.hidden = false;
    await getMedia();
    makeConnection();
};

const handleWelcomesubmit = async (event) => {
    event.preventDefault();
    const input = welcomeForm.querySelector("input");
    await initCall();
    socket.emit("join_room", input.value);
    console.log("joinRoom")
    roomName = input.value;
    input.value="";
}

welcomeForm.addEventListener("submit", handleWelcomesubmit)

//clientA, 방에 이미 있던 사람
socket.on("welcome", async () => {
    const offer = await myPeerConnection.createOffer();
    myPeerConnection.setLocalDescription(offer);
    console.log("offer >>> ", offer)
    socket.emit("offer", offer, roomName);
});
//ClientB, 방에 새로 들어온 사람
socket.on("offer", async (offer) => {
    console.log("receive the offer");
    myPeerConnection.setRemoteDescription(offer);
    const answer = await myPeerConnection.createAnswer();
    myPeerConnection.setLocalDescription(answer);
    socket.emit("answer", answer, roomName);
    console.log("sent the answer");

});
//ClientA, Answer 수신 저장
socket.on("answer", async (answer) => {
    console.log("recieve the answer");
    myPeerConnection.setRemoteDescription(answer);
});

socket.on("ice", ice => {
    console.log("receive candidate");
    myPeerConnection.addIceCandidate(ice);
})

function makeConnection() {
    myPeerConnection = new RTCPeerConnection({
        iceServers: [
            {
                urls: [
                    "stun:stun.l.google.com:19302",
                ],
            },
        ],
    });
    console.log("myPeerConnection.iceServers")
    console.log(myPeerConnection)
    myPeerConnection.addEventListener("icecandidate", handleIce);
    myPeerConnection.addEventListener("addstream", handleAddStream);
    myStream.getTracks().forEach((track) => myPeerConnection.addTrack(track, myStream));
}

const handleIce = (data) => {
    console.log("sent candidate");
    socket.emit("ice", data.candidate, roomName);
}

const handleAddStream = (data) => {
    const peersSteam = document.getElementById("peersStream");
    console.log("got an event from my peer");
    peersSteam.srcObject = data.stream
}

function timer(time){
    return new Promise(function (resolve, reject){
        setTimeout(function(){
            resolve(time);
        }, time)
    })
}

async function run() {
        console.log(1);
        console.log('start');
    console.log(2);
        var time = await timer(1000);
    console.log(3);
        console.log('time' +time);
    console.log(4);
        time = timer(time+1000);
    console.log(5);
        console.log('time:'+ time);
    console.log(6);
        time = timer(time+1000);
    console.log(7);
        console.log('time;'+ time);
    console.log(8);
        console.log('end')
    console.log(9);
}
console.log("before");

run();
console.log("after");
