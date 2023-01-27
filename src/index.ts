import * as express from "express";
import { Request, Response, NextFunction } from "express";
import * as expressws from "express-ws";

import * as fs from 'fs';
import * as path from 'path';
import * as https from "https";
import * as http from "http";
import { PrismaClient, Prisma } from '@prisma/client';
import { roles } from './resources/roles';
import { users } from './resources/users';
import { applications } from './resources/applications'
import { appElements } from "./resources/appElement";
import {pages} from "./resources/webpages";
import { hostname } from "os";

const prisma = new PrismaClient();
const app: any = express();
const server = http.createServer(app);
expressws(app, server);

const port = process.env.PORT || 3000;
const host =process.env.HOST || "127.0.0.1";

app.ws('/', (ws: { on: (arg0: string, arg1: (message: any) => Promise<void>) => void; send: (arg0: string) => void; }) => {
    console.log("Got websocket connection")
  
    ws.on("message", async (message: string) => {
      const data = JSON.parse(message);
      console.log("Received message", data)
      ws.send(JSON.stringify({ body: "foo" }));
    });
  });
// const options = {
//     key: fs.readFileSync(`${__dirname}/certs/private.key`),
//     cert: fs.readFileSync(`${__dirname}/certs/server-cert.pem`),
//     ca: [
//       fs.readFileSync(`${__dirname}/certs/ca-root-cert.pem`),
//     ],
//     requestCert: true,
//     rejectUnauthorized: true,
//   };


app.use(express.json());
app.use('/static', express.static(path.join(__dirname, 'static')));

app.use('/roles', roles)
app.use('/users', users);
app.use('/applications', applications);
app.use('/appelements', appElements);
// app.use('/pages', pages);


/* tslint:disable:no-unused-variable */
server.listen(port);

console.log(`COE running on port http://${host}:${port}`)