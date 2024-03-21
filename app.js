const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");
const session = require("express-session");
const MongoDBStore = require("connect-mongodb-session")(session);
const store = new MongoDBStore({
  uri: `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.o8ckbff.mongodb.net/?retryWrites=true&w=majority`,
  databaseName: "test",
  collection: "sessions",
});

const compression = require("compression");

const products = require("./routes/products.js");
const users = require("./routes/users.js");
const cart = require("./routes/cart.js");

const app = express();

app.use(compression());
app.use("/uploads", express.static(path.join(__dirname, "uploads")));
app.use(express.static(path.join(__dirname, "./public/imgs")));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

app.use(
  cors({
    origin: [process.env.CLIENT_APP, process.env.ADMIN_APP],
    default: process.env.CLIENT_APP,
    credentials: true,
  })
);
app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
    store: store,
    cookie: {
      maxAge: 7 * 24 * 60 * 60 * 1000,
      sameSite: "Lax",
    },
  })
);

app.use("/products", products);
app.use("/users", users);
app.use("/cart", cart);
app.use((req, res) => {
  return res.redirect(`${process.env.CLIENT_APP}/123`);
});

mongoose
  .connect(
    `mongodb+srv://${process.env.MONGODB_USER}:${process.env.MONGODB_PASS}@cluster0.o8ckbff.mongodb.net/test?retryWrites=true&w=majority`
  )
  .then((result) => {
    const io = require("./socket.js").init(
      app.listen(process.env.PORT || 5000)
    );
    io.on("connection", (socket) => {
      socket.on("createRoom", (roomId) => {
        socket.join(roomId);
        io.emit("roomCreated", roomId);
      });
      socket.on("joinRoom", (roomId) => {
        socket.join(roomId);
      });
      socket.on("frontend send messages", (data) => {
        io.to(data.roomId).emit("server send messages", data);
      });
      socket.on("end chat", (roomId) => {
        io.to(roomId).emit("server send roomId to end chat", roomId);
      });
      socket.on("disconnecting", () => {
        // console.log(socket.rooms);
      });
    });
  })
  .catch((err) => console.log(err));
