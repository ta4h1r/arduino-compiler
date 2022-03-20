FROM node:14

RUN apt-get update && apt-get install -y curl
RUN curl -fsSL https://raw.githubusercontent.com/arduino/arduino-cli/master/install.sh | sh
RUN arduino-cli core update-index
RUN arduino-cli core install arduino:avr

RUN arduino-cli config init
COPY ./arduino-cli.yaml /root/.arduino15/arduino-cli.yaml

WORKDIR /usr/src/app

COPY package*.json ./

# RUN npm install
# If you are building your code for production
RUN npm ci --only=production

COPY . .


RUN arduino-cli lib install --zip-path ./libs/ks_Matrix.zip
RUN arduino-cli lib update-index

RUN arduino-cli lib install servo 
RUN arduino-cli lib install "Adafruit Motor Shield library"

RUN arduino-cli lib upgrade


EXPOSE 1000

CMD ["node", "index.js"]