import {generateRandomId} from "./utils.js";

export function sseRequest(request, response, itemQueue, socket, litc, userId) {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  
  const params = queryParams(request.url);
  console.log(request.url);
  
  if(request.url.startsWith("/someMethod?")) {
  }
}

function queryParams(requestUrl) {
  const params = {};

  const queryString = requestUrl.split("?").pop().split("&");
  for(let j = 0; j < queryString.length; j++) {
    const param = queryString[j].split("=");
    if(param.length == 2) {
      params[param[0]] = decodeURIComponent(param[1]);
    }
  }

  return params;
}
