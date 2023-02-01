import {generateRandomId, arrayCompare, newLogBuffer, getChunkedData} from "./utils.js";

export function postRequest(request, response, ip, country, itemQueue, userId) {
  const logger = new newLogBuffer();
  logger.log(`{"ip": "${ip}", "country": "${country}", "userId": "${userId}", `);
  
  getChunkedData(request).then(function(postData) {
    const postDataJSON = JSON.parse(postData);
    const method = postDataJSON.method;
    const requestId = postDataJSON.id;
    const params = postDataJSON.params;
    
    logger.log(`, "postData": ${postData}`);
    
    let result;
    
    if(method === "something") {
      result = somethingMethod(userId);
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

function somethingMethod(userId) {
  return {};
}


