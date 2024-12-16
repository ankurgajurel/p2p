import * as express from "express";
import { createServer } from "http";
import { Server } from "socket.io";
import * as cors from "cors";
import { v4 as uuidv4 } from "uuid";

const app = express();
const httpServer = createServer(app);
const io = new Server(httpServer as any, {
  cors: {
    origin: process.env.CLIENT_URL || "http://localhost:7005",
    methods: ["GET", "POST"],
  },
});

app.use(cors());
app.use(express.json());

app.post("/api/room", (req, res) => {
  const roomId = uuidv4().split("-").slice(1, 4).join("-");
  res.json({ roomId });
});

io.on("connection", (socket) => {
  socket.on("join-room", (roomId) => {
    socket.join(roomId);
    socket.to(roomId).emit("user-connected");
  });

  socket.on("offer", (offer, roomId) => {
    socket.to(roomId).emit("offer", offer);
  });

  socket.on("answer", (answer, roomId) => {
    socket.to(roomId).emit("answer", answer);
  });

  socket.on("ice-candidate", (candidate, roomId) => {
    socket.to(roomId).emit("ice-candidate", candidate);
  });
});

const PORT = process.env.PORT || 7001;
httpServer.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
