import {generateRandomId, arrayCompare, newLogBuffer, getChunkedData} from "./utils.js";

export function postRequest(request, response, ip, country, userId, uto) {
  const logger = new newLogBuffer();
  logger.log(`{"ip": "${ip}", "country": "${country}", "userId": "${userId}", `);
  
  getChunkedData(request).then(function(postData) {
    const postDataJSON = JSON.parse(postData);
    const method = postDataJSON.method;
    const requestId = postDataJSON.id;
    const params = postDataJSON.params;
    
    logger.log(`, "postData": ${postData}`);
    
    let result;
    
    if(method === "orders") {
      result = ordersMethod(uto);
    } else if(method === "userOrders") {
      result = userOrdersMethod(userId, uto);
    } else if(method === "buy") {
      result = buyMethod(params, userId, uto);
    } else if(method === "paid") {
      result = paidMethod(params, userId, uto);
    } else if(method === "received") {
      result = receivedMethod(params, userId, uto);
    }
    
    const responseVal = JSON.stringify({"jsonrpc": "2.0", "id": requestId, result});
    response.writeHead(200, {"Content-Type": "application/json"});
    response.end(responseVal, "utf-8");
    console.log(logger.buffer + `"response": ${responseVal}}`);
  }).catch(function(error) {
    console.log(logger.buffer + `"postException": ${error}}`);
    response.writeHead(400);
    response.end();
  });
}

function ordersMethod(uto) {
  const userIdKeys = Object.keys(uto);
  
  let orders = [];
  
  for(const userId of userIdKeys) {
    const orderIdKeys = Object.keys(uto[userId]);
    for(const orderId of orderIdKeys) {
      const order = uto[userId][orderId];
      if(!order.buyerId) {
        orders.push(order);
      }    
    }
  }

  return orders;
}

function userOrdersMethod(userId, uto) {
  if(!uto[userId]) {
    return [];
  }
  
  const orders = [];
  
  const orderIdKeys = Object.keys(uto[userId]);
  
  for(const orderId of orderIdKeys) {
    orders.push(uto[userId][orderId]);
  }

  return orders;
}

function buyMethod(params, userId, uto) {
  const order = uto[params.sellerId][params.orderId];
  order.buyerId = userId;
  
  if(!uto[userId]) {
    uto[userId] = {};
  }
  
  uto[userId][order.orderId] = order;
  
  return {};
}

function paidMethod(params, userId, uto) {
  uto[userId][params.orderId].paid = "true";
  
  return {};
}

function receivedMethod(params, userId, uto) {
  // TODO make lightning payment here
  uto[userId][params.orderId].received = "true";
  
  return {};
}
