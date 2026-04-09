// Singleton Socket.IO instance shared across route files
let io = null;

function setIO(ioInstance) {
  io = ioInstance;
}

function getIO() {
  return io;
}

module.exports = { setIO, getIO };
