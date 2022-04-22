//dependencies

require("dotenv").config();
require("express-async-errors");
const fileUpload = require("express-fileupload");
const express = require("express");
const cloudinary = require("cloudinary").v2;
const mongoose = require('mongoose')
//security dependencies

const helmet = require("helmet");
const cors = require("cors");
const xss = require("xss-clean");

//app initialisation

const app = express();
const server = require("http").createServer(app);
const { Server } = require("socket.io");
const io = new Server(server, {
   cors: {
      origin: "*",
   },
});
const PORT = process.env.PORT || 8800;

//cloudinary configuration

cloudinary.config({
   cloud_name: process.env.CLOUD_NAME,
   api_key: process.env.CLOUD_API_KEY,
   api_secret: process.env.CLOUD_API_SECRET,
});

//Routes

const authRouter = require("./routes/auth");
const userRouter = require("./routes/user");
const postRouter = require("./routes/post");
const articleRouter = require("./routes/article");
const chatRouter = require("./routes/chat");
const messageRouter = require("./routes/message");
const PostRoute = require('./admin/routes')

//middlewares

const errorHandlerMiddleware = require("./middleware/error-handler");
const authorizationMiddleware = require("./middleware/authorization");
const notFoundMiddleware = require("./middleware/not-found");
const notAdmin = require("./middleware/admin")

app.use(xss());
app.use(helmet());
app.use(express.json());
app.use(fileUpload({ useTempFiles: true }));
app.use(cors());

app.get("/", (req, res) => {
   res.status(200).json({ msg: "welcome" });
});

// socket io

const { addUser, getUserID, getSocketID, removeUser } = require("./socket/users");

io.on("connection", socket => {
   socket.on("add user", id => {
      io.emit("usersOnline", addUser(id, socket.id));
   });
   socket.on("send message", (message, to) => {
      socket.to(getSocketID(to)).emit("receive message", message, getUserID(socket.id));
   });
   socket.on("disconnect", () => {
      io.emit("usersOnline", removeUser(socket.id));
   });
});


//routes
app.use('/api', PostRoute)
app.use("/api/v1/auth", authRouter);
app.use("/api/v1/user", authorizationMiddleware, userRouter);
app.use("/api/v1/post", authorizationMiddleware, postRouter);
app.use("/api/v1/article", authorizationMiddleware, articleRouter);
app.use("/api/v1/chat", authorizationMiddleware, chatRouter);
app.use("/api/v1/message", authorizationMiddleware, messageRouter);

app.use(errorHandlerMiddleware);
app.use(notFoundMiddleware);
mongoose.set('bufferCommands', false);


const start = async () => {
   try { mongoose.connect(
    'mongodb+srv://user:1312@cluster0.pxu2h.mongodb.net/gamers?retryWrites=true&w=majority',
    { useNewUrlParser: true, useUnifiedTopology: true,useCreateIndex: true  },
    () => {
      console.log("Connected to MongoDB");
    }
  );


       server.listen(PORT, () => {
         console.log(`Server is listening on port ${PORT}`);
      });
   } catch (error) {
      console.log(error);
   }
};


start();
