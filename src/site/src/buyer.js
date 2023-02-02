import {setUserId} from "./utils.js";
import {ordersRpc, buyRpc, paidRpc} from "./api.js";

document.addEventListener("DOMContentLoaded", async function() {
  setUserId();

  const ordersResult = await ordersRpc();
  const ordersContainer = document.getElementById("ordersContainer");
  
  const orderDetailsContainer = document.getElementById("orderDetailsContainer");
  
  for(const order of ordersResult) {

    const orderDetails = document.createElement("span");
    orderDetails.innerText = JSON.stringify(order);
    
    const buyButton = document.createElement("button");
    buyButton.innerText = "Buy";
    buyButton.setAttribute("type", "button");
    buyButton.addEventListener("click", async function() {
      await buyRpc(order.sellerId, order.orderId);
    
      const bankDetailsContainer = document.createElement("span");
      bankDetailsContainer.innerText = order.bankDetails;
      
      const paidButton = document.createElement("button");
      paidButton.innerText = "I Have Paid";
      paidButton.setAttribute("type", "button");
      paidButton.addEventListener("click", async function() {
        await paidRpc(order.orderId);
      });
      
      orderDetailsContainer.innerHTML = "";
      orderDetailsContainer.append(bankDetailsContainer);
      orderDetailsContainer.append(paidButton);
      
      orderDetailsContainer.style.display = "block";
    });
    
    const orderItem = document.createElement("li");

    orderItem.append(orderDetails);    
    orderItem.append(buyButton);
    
    ordersContainer.append(orderItem);
  }

});
