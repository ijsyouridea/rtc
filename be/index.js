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
    socket.broadcast.emit("offer", data);
  });

  socket.on("answer", (data) => {
    socket.broadcast.emit("answer", data);
  });

  socket.on("ice-candidate", (data) => {
    socket.broadcast.emit("ice-candidate", data);
  });

  socket.on("disconnect", () => {
    users = users.filter((id) => id !== socket.id);
  });
});
