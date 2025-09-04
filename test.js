import { io } from "socket.io-client";
import { randomUUID } from 'crypto';

const socket = io("http://82.23.190.137:4300/banks");

socket.on("connect", () => {
  console.log("connected");
  
  const transactionData = {
    "id": randomUUID(),
    "transactions": [
      {
        "from": "BA01F9C4",
        "to": "BA03D5F9",
        "amount": 50
      }
    ]
  };

  console.log("transaction:", transactionData);
  socket.emit("transaction:confirm", transactionData, (response) => {
    console.log("response:", response);
  });
});

socket.on("transaction:redirect", (data) => {
  console.log("redirect");
  console.log("content:", JSON.stringify(data, null, 2));
});

socket.on("transaction:validated", () => {
  console.log("validated");
});

socket.on("transaction:cancelled", () => {
  console.log("cancelled");
});

socket.on("connect_error", (err) => {
  console.error("error :", err.message);
});