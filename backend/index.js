const http=require("http");
const express =require("express");
const cors = require("cors");
const socketIO = require("socket.io");

const app=express();
const port= process.env.PORT || 8000;

const users=[{}];

app.use(cors());
app.get("/",(req,res)=>{
    res.send("HELL ITS WORKING");
})

const server=http.createServer(app);

const io=socketIO(server);

const product = [
    {
        id:1,
        title:'product1'
    },
    {
        id:2,
        title:'product2'
    },
    {
        id:3,
        title:'product3'
    },
    {
        id:4,
        title:'product4'
    },
    {
        id:5,
        title:'product5'
    }
];

io.on("connection",(socket)=>{
    console.log("New Connection");

    socket.emit('products',{ product: product });

    socket.on('chatMessage',(message)=>{
      console.log(`Node Msg: ${message.message}, Node ID: ${message.id}`);
      io.emit('chatMessage',{ product: product });
    })

    socket.on('disconnect',()=>{
          socket.broadcast.emit('leave',{user:"Admin",message:`${users[socket.id]}  has left`});
        console.log(`user left`);
    })
});


server.listen(port,()=>{
    console.log(`Server running on ${port}`);
})