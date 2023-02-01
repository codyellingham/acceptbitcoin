import {randomBytes} from "crypto";

export function generateRandomId() {
  return randomBytes(32).toString("hex");
}

export function arrayCompare(array1, array2) {
  return array1.length === array2.length && array1.every(function(value, index) { return value === array2[index]});
}

export function newLogBuffer() {
  return {
    "buffer": "",
    "log": function(line) {
      this.buffer += line;
    },
  };
}

export function getChunkedData(request) {
  return new Promise(function(resolve, reject) {
    let chunkedData = "";
    request.on("data", function(chunk) {
      chunkedData += chunk.toString();
    });
    // TODO request on error
    request.on("end", function() {
      resolve(chunkedData);
    });
  });
}
