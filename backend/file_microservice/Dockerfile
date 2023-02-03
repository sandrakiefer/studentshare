FROM node:18
WORKDIR /usr/src/app
COPY package.json package*.json ./
RUN npm install --only=production
COPY . .
EXPOSE 8080
CMD [ "npm", "start" ]