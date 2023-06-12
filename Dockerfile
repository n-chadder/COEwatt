FROM node:18

WORKDIR /coe

COPY package.json ./
COPY package-lock.json ./

RUN npm install

COPY . ./

CMD [ "sh", "run_commands.sh" ]

EXPOSE 3000