import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from '@prisma/client';
import * as pug from "pug";

const compiledSchedule = pug.compileFile('src/static/schedule.pug');

const prisma = new PrismaClient()
const router = express.Router()


router.get('/', async (req: Request, res: Response) => {
  try {
    let events = req.query.year ?
    await prisma.event.findMany({
      where: {
        Start: {
          lte: new Date(`${req.query.year}-12-31`).toISOString(),
          gte: new Date(`${req.query.year}-01-01`).toISOString()
        }
      },
      include: {
        App: true,
        Status: true,
      },
    }) :
    await prisma.event.findMany({
      include: {
        App: true,
        Status: true,
      },
    });

    let success = req.flash('success');
    let error   = req.flash('error');
    let result  = {
      "events": events,
      "success": success,
      "error": error
    }

    res.format({
      'application/json': function(){
        res.status(200).json(events);
        return;
      },
      'text/html': function(){
        let page = compiledSchedule({result});
        res.status(200).send(page);
        return;
      }
    });
  }
  catch(e: any) {
    console.log(e);
    res.status(500).send('<h1>Something Went Wrong</h1>');
  }

});

router.post('/', async (req: Request, res: Response) => {
  
  try {
    const App: number      = Number(req.body.App);
    const Start: Date      = new Date(req.body.Start);
    const EstimatedCompletion: Date = new Date(req.body.EstimatedCompletion);
    const ActualCompletion: Date = new Date(req.body.ActualCompletion);
    const Notes: string    = req.body.Notes;
    const StatusID: number = Number(req.body.status);
    
    const result = await prisma.event.create({
      data: {
        App: {
          connect: { id: App },
        },
        Start: Start,
        EstimatedCompletion: EstimatedCompletion,
        ActualCompletion: ActualCompletion,
        Notes: Notes,
        Status: {
          connect: { id: StatusID },
        }
      }
    });
    
    res.format({
      'application/json': function(){
        res.status(200).json(result);
        return;
      },
      'text/html': function(){
        req.flash("success", "Event added to schedule");
        res.redirect('/events');
        return;
      }
    });
  } catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      if (e.code === 'P2002') {
        console.log('There is a unique constraint violation, a new user cannot be created with this email')
      }
      res.json(req.body);
    }
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  try{
    const event = await prisma.event.findUnique({
      where: {
          id: Number(id),
      },
    });
    res.status(200).json(event);
    return;
  }
  catch (e: any){
    res.status(404).json({});
  }

});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const App: number   = Number(req.body.App);
    const Start: Date   = new Date(req.body.Start);
    const EstimatedCompletion: Date = new Date(req.body.EstimatedCompletion);
    const ActualCompletion: Date = new Date(req.body.ActualCompletion);
    const Notes: string = req.body.Notes;
    const StatusID: number = Number(req.body.status);

    const result = await prisma.event.update({
      where: {
          id: Number(id),
      },
      data: {
          App: {
            connect: { id: App },
          },
          Start, 
          EstimatedCompletion: EstimatedCompletion,
          ActualCompletion: ActualCompletion,
          Notes,
          Status: {
            connect: { id: StatusID },
          }
      },
    });
    res.format({
      'application/json': function(){
        res.status(200).json(result);
        return;
      },
      'text/html': function(){
        req.flash("success", "Event was edited successfully");
        res.redirect(`/events`);
        return;
      }
    });
  }
  catch (e:any) {
    res.status(500).json(req.body);
  }
});

router.delete('/:id', async (req: any, res: any) => {
  try {
    const id = req.params.id
    const event = await prisma.event.delete({
      where: {
        id: Number(id),
      },
    });
    res.format({
      'application/json': function(){
        res.status(200).json(event);
        return;
      },
      'text/html': function(){
        req.flash('success', 'Event was deleted successfully');
        res.redirect(`/events`);
        return;
      }
    });
  }
  catch (e: any) {
    res.status(500).send(e.code)
  }
});

export { router as events }