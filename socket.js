let io;
module.exports = {
  init: (httpServer) => {
    io = require("socket.io")(httpServer, {
      cors: {
        origin: [process.env.CLIENT_APP, process.env.ADMIN_APP],
        allowedHeaders: [
          "Access-Control-Allow-Origin",
          "Access-Control-Allow-Credentials",
        ],
        credentials: true,
      },
    });
    return io;
  },
  getIO: () => {
    if (!io) {
      throw new Error("Socket.io not initialized!");
    }
    return io;
  },
};
