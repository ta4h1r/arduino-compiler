FROM node:14

RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | BINDIR=/usr/bin sh
RUN arduino-cli core update-index

WORKDIR /usr/src/app

COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm ci --only=production

COPY . .

EXPOSE 1000

CMD ["node", "index.js"]