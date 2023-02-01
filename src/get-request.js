import {readdirSync, readFileSync} from "fs";

import {newLogBuffer} from "./utils.js";

const siteDirectory = "./src/site/src/";

const staticSite = {};
function readStaticSite() {
  readdirSync(siteDirectory).map(function(fileName) {
    staticSite["/" + fileName] = readFileSync(siteDirectory + fileName);
  });
}
readStaticSite();

function return404(response, staticSite) {
  response.writeHead(404, {"Content-Type": "text/html"});
  response.end(staticSite["/404.html"], "utf-8");
}

export function getRequest(request, response, ip, country, userId) {
  const logger = new newLogBuffer();
  logger.log(`{"ip": "${ip}", "country": "${country}", "userId": "${userId}", `);

  let requestUrl = request.url;
  if(request.url.indexOf("?") !== -1) {
    requestUrl = request.url.substring(0, request.url.indexOf("?"));
  }
  
  if(requestUrl === "/") {
    requestUrl = "/index.html";
  }
  if(!requestUrl.includes(".")) {
    requestUrl += ".html";
  }
  
  if(requestUrl in staticSite) {
    if(requestUrl.endsWith(".html")) {
      response.writeHead(200, {"Content-Type": "text/html"});
      
      if("referer" in request.headers) {
        logger.log(`"referer": "${request.headers.referer}", `);
      }      
      if("user-agent" in request.headers) {
        logger.log(`"user-agent": "${request.headers["user-agent"]}", `);
      }
      
      console.log(logger.buffer + `"get": "${request.url}"}`);
    } else if(requestUrl.endsWith(".js")) {
      response.writeHead(200, {"Content-Type": "text/javascript"});
    } else if(requestUrl.endsWith(".css")) {
      response.writeHead(200, {"Content-Type": "text/css"});
    } else {
      return404(response, staticSite);
      return;
    }

    response.end(staticSite[requestUrl], "utf-8");
  } else {
    return404(response, staticSite);
  }
}
