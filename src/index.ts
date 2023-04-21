import * as express from "express";
import { Request, Response, NextFunction } from "express";
import * as expressws from "express-ws";

import * as path from 'path';
import * as http from "http";
import { PrismaClient, Prisma } from '@prisma/client';
import { applications } from './resources/applications';
import { events } from './resources/events';
import {pages} from "./resources/pages";
import { testrun } from "./resources/TestRun";
import * as pug from "pug";
import * as methodOverride from "method-override";
import flash = require('connect-flash');
import * as session from "express-session";

const prisma = new PrismaClient();
const app: any = express();
const server = http.createServer(app);
expressws(app, server);

const port = process.env.PORT || 3000;
const host = process.env.HOST || "127.0.0.1";

const compiledHome = pug.compileFile("src/static/home.pug");
const compiledDashboard = pug.compileFile("src/static/dashboard.pug");

app.ws('/', (ws: { on: (arg0: string, arg1: (message: any) => Promise<void>) => void; send: (arg0: string) => void; }) => {
    console.log("Got websocket connection")
  
    ws.on("message", async (message: string) => {
      const data = JSON.parse(message);
      console.log("Received message", data)
      ws.send(JSON.stringify({ body: "foo" }));
    });
  });

app.get('/', async (req: Request, res: Response) => {
  res.status(200).send(compiledHome({}));
});

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use('/static', express.static(path.join(__dirname, 'static')));
app.use(session({
  secret:'flash',
  saveUninitialized: true,
  resave: true
}));
app.use(flash());
app.use(methodOverride('_method'));
app.use('/applications', applications);
app.use('/events', events);
app.use('/pages', pages);
app.use('/testrun', testrun);

app.get('/dashboard', (req: Request, res: Response) => {
  res.status(200).send(compiledDashboard({}));
});

server.listen(port);

console.log(`COE running on port http://${host}:${port}`)