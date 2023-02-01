import {createConnection} from "net";

import {generateRandomId} from "./utils.js";

export function connectToLit(litc, lastPayIndex) {
  return new Promise(function(resolve) {
    let data = "";
    
    const startOfJsonRpcMessage = `{"jsonrpc":"2.0","id":"`;
    const endOfJsonRpcMessage = `}\n\n`;
    
    let unixSocketPath = "/home/c/.lightning/bitcoin/lightning-rpc";
    if(process.argv[2] !== undefined) {
      unixSocketPath = process.argv[2];
    }
    const socket = createConnection(unixSocketPath);
    
    socket.on("connect", function() {
      waitAnyInvoice(socket, litc, lastPayIndex);
      resolve(socket);
    }).on("data", function(buffer) {
      let bufferString = buffer.toString();
      console.log(`{"socketRead": ${bufferString.replace(/\n|\r/g, "")}}`);
      
      data += bufferString;

      while(true) {
        const startOfMessage = data.indexOf(startOfJsonRpcMessage);
        const endOfMessage = data.indexOf(endOfJsonRpcMessage);
      
        if(startOfMessage !== -1 && endOfMessage !== -1) {  
          const dataJSON = JSON.parse(data.substring(startOfMessage, endOfMessage + 1));
          
          if(litc[dataJSON.id]) {
            if(dataJSON.result && litc[dataJSON.id].result) {
              litc[dataJSON.id].result(dataJSON.result);
            } else if(dataJSON.error && litc[dataJSON.id].error) {
              litc[dataJSON.id].error(dataJSON.error);
            }
  
            delete litc[dataJSON.id];
          }
          
          data = data.substring(endOfMessage + endOfJsonRpcMessage.length);
        } else {
          break;
        }
      }
    }).on("close", function() {
      // TODO
      throw "lit socket closed";
    });
  });
}

export function litcCacheClean(litc) {
  setInterval(function() {
    const currentTime = Date.now();
    const lightningKeys = Object.keys(litc);
    
    for(const lightningId of lightningKeys) {
      if(currentTime > litc[lightningId].expiry) {
        delete litc[lightningId];
      }
    }
  }, (1000 * 60 * 30)); // 30mins in millis
}

function waitAnyInvoice(socket, litc, lastPayIndex) {
  const lightningId = generateRandomId();
  const socketWrite = JSON.stringify({"jsonrpc": "2.0", "id": lightningId, "method": "waitanyinvoice", "params": [lastPayIndex]});
  
  litc[lightningId] = {
    "expiry": Number.MAX_VALUE, // never expires
    "result": function (result) {
      if(litc[result["label"]]) {
        litc[result["label"]].result(result);
        delete litc[result["label"]];
      }
      lastPayIndex++;
      waitAnyInvoice(socket, litc, lastPayIndex);
    }
  };
  
  console.log(`{"socketWrite": ${socketWrite}}`);
  socket.write(socketWrite + '\n');
}
