FROM node:latest

COPY package-lock.json package.json ./
RUN npm install
COPY . .

CMD ["npm", "run", "start"]