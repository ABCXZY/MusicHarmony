// const http = require('http');
// const express = require('express');
// const Server = require('socket.io');
// const cors = require('cors');
//
// const app = express();
// app.use((req, res) => {
//     res.header("Access-Control-Allow-Origin", "*"); // 모든 도메인 허용
// });
// app.get("/", (req, res) => {
//     res.send({ response: 'Server is up and running' }).status(200)
// });
// const httpServer = http.createServer(app);
// const wsServer = Server(httpServer);
//
//
//
//
//
// wsServer.on("connection", socket => {
//     socket.on("offer", (data) => console.log(data))
// });
// httpServer.listen(8000, () => console.log("app.open"));

const express = require('express')
const socketio = require('socket.io')
const http = require('http')

const cors = require('cors')
const router = require('./router')
const axios = require("axios");

const PORT = process.env.PORT || 4000


const app = express()
const server = http.createServer(app)
const io = socketio(server,{
    cors:{
        origin:"*",
    }
})
app.use(cors())
app.use(router)

let room = {
}

io.on('connection', (socket) => {
    socket.on("join", (roomId, userName)=> {
        room[socket.id] = roomId;
        axios.post("http://localhost:8080/addUser", {"roomId":roomId,"userName":socket.id } )
            .then( () =>{
                axios.get("http://localhost:8080/getUsers/"+roomId).then(e => {
                    let users = e.data;
                    console.log(users);
                    socket.join(roomId);
                    socket.to(roomId).emit("welcome", users);
                }).catch(e => console.log(e))}
            )
        // socket.to(roomId).emit("welcome");
        // console.log(room.key)
    });
    socket.on("offer", (e) => {
        socket.to(e.receive).emit("offer", {
            "sdp": e.sdp,
            "sender": e.sender,
        });
        console.log(e.receive+"  -->  "+e.sdp);
    });

    socket.on("answer", (e) => {
        socket.to(e.receive).emit("answer", {
            "sdp": e.sdp,
            "sender": e.sender,
        });
    });

    socket.on("ice", (e) => {
        socket.to(e.receive).emit("ice", {
            ice : e.candidate,
            sender: e.sender,
        });

        console.log("ice");
    });

    socket.on("disconnect", (e) => {

        if(room[socket.id]){
            const roomId = room[socket.id];
            axios.post("http://localhost:8080/removeUser", {"roomId":roomId , "userName":socket.id});

            delete room[socket.id];

            console.log("연결 종료", socket.id);
            console.log("연결 방이름", roomId);
        }
    })
})
server.listen(PORT, () => console.log(`서버가 ${PORT} 에서 시작되었어요`))