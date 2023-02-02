import {generateRandomId} from "./utils.js";

export function sseRequest(request, response, socket, litc, userId, uto) {
  response.writeHead(200, {
    "Content-Type": "text/event-stream",
    "Cache-Control": "no-cache",
    "Connection": "keep-alive",
  });
  
  const params = queryParams(request.url);
  console.log(request.url);
  
  if(request.url.startsWith("/invoice?")) {
    const lightningId = generateRandomId();

    const msatoshi = 2000;
    const invoiceLabel = generateRandomId();
    const description = "test";
    const expiry = 1 * 60 * 10; // 10mins in seconds    
    
    litc[lightningId] = {
      "expiry": Date.now() + (1000 * 60 * 5), // 5mins in millis
      "result": function (result) {
        const responseResult = `{"result": "${result.bolt11}"}`;
        response.write(`event:invoice\ndata:${responseResult}\n\n`);
      }
    };
    
    litc[invoiceLabel] = {
      "expiry": Date.now() + (1000 * 60 * 5), // 5mins in millis
      "result": function (result) {
        const orderId = generateRandomId();
        const order = {orderId, sellerId: userId, "amount": result.msatoshi, "fiat": generateRandomId().substring(0, 6), "bankDetails": generateRandomId().substring(0, 6)};
      
        if(!uto[userId]) {
          uto[userId] = {};
        }
        
        uto[userId][orderId] = order;
      
        const responseResult = `{"result": "paid"}`;
        response.write(`event:invoicePaid\ndata:${responseResult}\n\n`);
      }
    };
    
    const socketWrite = JSON.stringify({"jsonrpc": "2.0", "id": lightningId, "method": "invoice", "params": [msatoshi, invoiceLabel, description, expiry]});
    console.log(`"socketWrite": ${socketWrite}`);
    socket.write(socketWrite + '\n');
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
