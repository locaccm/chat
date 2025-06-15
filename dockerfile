FROM node:20-alpine

ARG DATABASE_URL
ENV DATABASE_URL=${DATABASE_URL}

ARG AUTH_SERVICE_URL
ENV AUTH_SERVICE_URL=${AUTH_SERVICE_URL}

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY . .

RUN npm run dbpull
RUN npm run generate
RUN npm run build

EXPOSE 3000

CMD ["npm", "start"]
