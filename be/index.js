// server.js
const io = require("socket.io")(5001, {
  cors: { origin: "*" },
});

let users = [];

io.on("connection", (socket) => {
  console.log("User connected:", socket.id);

  socket.on("join", () => {
    users.push(socket.id);
    console.log(users);
    if (users.length > 1) {
      socket.emit("ready");
    }
  });

  socket.on("offer", (data) => {
    console.log("offer");
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    console.log("answer");
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    console.log("ice-candidate");
    socket.broadcast.emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    console.log("disconnect");
    users = users.filter((id) => id !== socket.id);
  });
});
