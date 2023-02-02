import {createServer} from "https";
import {readFileSync} from "fs";

import {getRequest} from "./get-request.js";
import {postRequest} from "./post-request.js";
import {sseRequest} from "./sse-request.js";
import {connectToLit, litcCacheClean} from "./lit.js";

const uto = {};

let socket;
const litc = {};
litcCacheClean(litc);
const lastPayIndex = 0;

const httpsServer = createServer(readCerts(), function(request, response) {
  const ip = getIp(request);
  const country = getCountry(request);
  let userId = "";
  if(request.headers.cookie) {
    const cookieParts = request.headers.cookie.split(";");
    for(const cookiePart of cookieParts) {
      if(cookiePart.trim().startsWith("acceptbitcoin=")) {
        userId = cookiePart.split('"')[3];
        break;
      }
    }
  }

  if(request.method === "GET") {
    if("accept" in request.headers && request.headers.accept === "text/event-stream") {
      sseRequest(request, response, socket, litc, userId, uto);
    } else {
      getRequest(request, response, ip, country, userId);
    }
  } else if(request.method === "POST") {
    postRequest(request, response, ip, country, userId, uto);
  }
});

function readCerts() {
  return {"key" : readFileSync("/etc/letsencrypt/live/acceptbitcoin.com/privkey.pem"), "cert" : readFileSync("/etc/letsencrypt/live/acceptbitcoin.com/fullchain.pem")};
}

function getIp(request) {
  if("cf-connecting-ip" in request.headers) {
    return request.headers["cf-connecting-ip"];
  } else {
    return request.connection.remoteAddress;
  }
}

function getCountry(request) {
  if("cf-ipcountry" in request.headers) {
    return request.headers["cf-ipcountry"];
  } else {
    return "XX";
  }
}

console.log(`{"server": "starting"}`);
connectToLit(litc, lastPayIndex).then(function(s) {
  socket = s;
  httpsServer.listen(8443);
  
  setInterval(function() {
    const certs = readCerts();
    httpsServer._sharedCreds.context.setCert(certs.cert);
    httpsServer._sharedCreds.context.setKey(certs.key);
  }, 7200000);
});
