# Chat App

A real-time chat application with contact access, built using Socket.io and Express.

## Features

- Real-time messaging with WebSockets
- User contact management
- REST API for fetching users and their contacts

## Table of Contents

- [Installation](#installation)
- [Usage](#usage)
- [API Documentation](#api-documentation)
- [Contact](#contact)

## Installation

### Requirements

- Node.js (latest stable version recommended)
- npm or yarn

### Dependencies:

- socket.io
- express
- nodemon

### Setup

git clone https://github.com/your-username/chat-app.git
cd chat-app

Install dependencies:

npm install

Start the server:

npm run dev

## Usage

### api-documentation

GET /users - Returns all users .
GET /users/:id - Fetches a specific user by ID.
GET /users/:id/contacts - Retrieves a user's linked contacts for chat.

Example request:

curl -X GET http://localhost:3000/users/1

## Contact
Owner: Leo Lomel
Email: leojet02100@live.fr