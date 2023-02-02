import {setUserId} from "./utils.js";
import {invoiceSSe, userOrdersRpc} from "./api.js";

async function userOrders() {
  const userOrdersResult = await userOrdersRpc();
  const ordersContainer = document.getElementById("ordersContainer");

  for(const order of userOrdersResult) {

    const orderDetails = document.createElement("span");
    orderDetails.innerText = JSON.stringify(order);
    
    const withdrawButton = document.createElement("button");
    withdrawButton.innerText = "Withdraw";
    withdrawButton.setAttribute("type", "button");
    withdrawButton.addEventListener("click", async function() {

    });
    
    const orderItem = document.createElement("li");

    orderItem.append(orderDetails);
    
    if(order.paid) {
      const receivedButton = document.createElement("button");
      receivedButton.innerText = "Received";
      receivedButton.setAttribute("type", "button");
      receivedButton.addEventListener("click", async function() {

      });
      orderItem.append(receivedButton);
    }
    
    if(!order.buyerId) {
      orderItem.append(withdrawButton);
    }
    
    ordersContainer.append(orderItem);
  }
}

document.addEventListener("DOMContentLoaded", async function() {
  setUserId();

  const bolt11Container = document.getElementById("bolt11Container");
  
  const invoiceButton = document.getElementById("invoiceButton");
  invoiceButton.addEventListener("click", async function() {
    const invoiceResult = invoiceSSe();
    
    // TODO reject
    invoiceResult.invoice.then(function(result) {
      bolt11Container.innerText = result;
      bolt11Container.style.display = "block";
    });
    
    // TODO reject
    invoiceResult.invoicePaid.then(async function(result) {
      bolt11Container.style.display = "none";
      await userOrders();
    });
  });
  
  await userOrders();
});
