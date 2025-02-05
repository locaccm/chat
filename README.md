# chat

Test file location :

All test files must be located in src/tests/ and follow the .test.ts naming convention. Only these files will be included in test execution and coverage reports.

Don't forget to delete a.test.ts

Description

Real time chat app and contact access 

Documentation

Requirements

socket.io
express
nodemon

Usage:

const socket = io("http://localhost:3000");

// Register user
socket.emit("register user", 1);

// Send a message
socket.emit("chat message", { from: 1, to: 5, message: "Hey Eve!" });

// Receive messages
socket.on("chat message", (data) => {
    console.log(`${data.from}: ${data.message}`);
});



Setup

Testing

Configuration

Road Map

Discussion

Owner

Leo Lomel - in charge of test and chat
leojet02100@live.fr
