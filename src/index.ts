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
import * as pug from "pug";
import axios, { AxiosError } from 'axios';
import * as methodOverride from "method-override";

const prisma = new PrismaClient();
const app: any = express();
const server = http.createServer(app);
expressws(app, server);

const port = process.env.PORT || 3000;
const host =process.env.HOST || "127.0.0.1";


const compiledApplicationEdit   = pug.compileFile("src/static/application_edit.pug");
const compiledApplicationDelete = pug.compileFile("src/static/application_confirm_delete.pug");

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
app.use(express.urlencoded({extended: true}));
app.use(methodOverride('_method'));

app.param('id', async (req: Request, res: Response, next: NextFunction) => {
  const id = req.params.id;
  try {
    // maybe https if that is avaliable?
    const response = await axios.get(`http://${host}:${port}/applications/${id}`);
    res.locals.axios = response;
    next();
  }
  catch(err: any | AxiosError) {
    res.locals.axios = err;
    next();
  }
});

app.get('/edit/application/:id', async (req: Request, res: Response) =>{
  let result = res.locals.axios; 
  if (result.status == 200) {
    let application = result.data;
    let page = compiledApplicationEdit({application});
    res.status(200).send(page);
    return; // res.end() ? 
  }
  else if(axios.isAxiosError(result)){
    // temp pages, need to build templates for 404 and 500
    if(result.response?.status == 404) {
      res.status(404).send('<h1>Sorry the page you are looking for does not exist</h1>');
      return;
    }
  }
  res.status(500).send('<h1>Sorry, something went wrong</h1>');
  return;

});

app.get('/delete/application/:id',async (req: Request, res: Response) => {
  let result = res.locals.axios;
  if (result.status == 200) {
    let application = result.data;
    let page = compiledApplicationDelete({application});
    res.status(200).send(page);
    return; // res.end() ? 
  }
  else if(axios.isAxiosError(result)){
    // temp pages, need to build templates for 404 and 500
    if(result.response?.status == 404) {
      res.status(404).send('<h1>Sorry the page you are looking for does not exist</h1>');
      return;
    }
  }
  res.status(500).send('<h1>Sorry, something went wrong</h1>');
  return;
})

app.use('/static', express.static(path.join(__dirname, 'static')));

app.use('/roles', roles);
app.use('/users', users);
app.use('/applications', applications);
app.use('/appelements', appElements);
// app.use('/pages', pages);


/* tslint:disable:no-unused-variable */
server.listen(port);

console.log(`COE running on port http://${host}:${port}`)