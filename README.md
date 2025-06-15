# Chat App

A real-time chat application with contact access, built using Socket.io and Express.

## Features

- Real-time messaging with WebSockets
- User contact management
- REST API for fetching users and their contacts

## Table of Contents

- [Installation](#installation)
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


## API Documentation

### Owners
- `GET /api/owners`  
  Retourne tous les owners.

- `GET /api/owners/:id`  
  Retourne un owner spécifique par son ID.

- `GET /api/owners/:id/tenants`  
  Retourne tous les tenants invités par un owner spécifique.

### Tenants
- `GET /api/tenants`  
  Retourne tous les tenants.

- `GET /api/tenants/:id`  
  Retourne un tenant spécifique par son ID.

- `GET /api/tenants/:id/owner`  
  Retourne l’owner qui a invité ce tenant.

### Messages
- `GET /api/messages?from=<senderId>&to=<receiverId>`  
  Retourne tous les messages échangés entre deux utilisateurs, triés par date.

- `POST /api/messages`  
  Envoie un message entre deux utilisateurs.  
  Body JSON attendu :
  ```json
  {
    "sender": "123",
    "receiver": "456",
    "content": "Hello!"
  }

Example request:

curl -X GET http://localhost:3000/api/owners/1

## Contact
Owner: Leo Lomel
Email: leojet02100@live.fr