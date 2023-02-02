import {generateRandomId} from "./utils.js";

export async function ordersRpc() {
  return await jsonrpc("orders", {});
}

export async function userOrdersRpc() {
  return await jsonrpc("userOrders", {});
}

export async function buyRpc(sellerId, orderId) {
  return await jsonrpc("buy", {sellerId, orderId});
}

export async function paidRpc(orderId) {
  return await jsonrpc("paid", {orderId});
}

export function invoiceSSe() {
  const eventSource = new EventSource(`https://${window.location.host}/invoice?`);
  
  const invoice = sserpc(eventSource, "invoice", false);
  const invoicePaid = sserpc(eventSource, "invoicePaid", true);
  
  return {invoice, invoicePaid};
}

function jsonrpc(method, params) {
  const url = `https://${window.location.host}`
  return new Promise(function(resolve, reject) {
    const xhr = new XMLHttpRequest();
    xhr.open("POST", url);
    xhr.setRequestHeader("Content-Type", "application/json");
    const id = generateRandomId();
    xhr.onload = function() {
      if (xhr.status === 200) {
        const response = JSON.parse(xhr.responseText);
        if (response.result) {
          resolve(response.result);
        } else if(response.error) {
          reject(response.error);
        } else {
          reject({"error": xhr.responseText});
        }
      } else {
        reject({"error": xhr.status});
      }
    };
    
    xhr.timeout = 8000;
    xhr.ontimeout = function() {
      reject({"error": "timeout"});
    };
    
    xhr.send(JSON.stringify({"jsonrpc": "2.0", "id" : id, "method" : method, "params" : params}));
  });
}

function sserpc(eventSource, eventName, shouldClose) {
  return new Promise(function(resolve, reject) {
    eventSource.addEventListener(eventName, function(event) {
      if(shouldClose) {
        eventSource.close();
      }
      const dataJSON = JSON.parse(event.data);
      if(dataJSON.result) {
        resolve(dataJSON.result);
      } else if(dataJSON.error) {
        reject(dataJSON.error);
      }
    });
  });
}
