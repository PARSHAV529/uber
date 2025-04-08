export let ioInstance;

export function setIo(io) {
  if (!ioInstance) {
    ioInstance = io;
  }
}

export function getIo() {
  return ioInstance;
}

// module.exports = {
//   setIo,
//   getIo,
//   ioInstance,
// };
