function notify(io, room, comment) {
    console.log(`Notifying room: ${room}`);
    io.to(room).emit("receive", { comment : comment});
}

module.exports = notify;
