import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from '@prisma/client';
import * as pug from "pug";

const compiledSchedule = pug.compileFile('src/static/schedule.pug');

const prisma = new PrismaClient()
const router = express.Router()


router.get('/', async (req: Request, res: Response) => {
  const events = await prisma.event.findMany({});  

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
      let page = compiledSchedule({});
      res.status(200).send(page);
      return;
    }
  })
});

router.post('/', async (req: Request, res: Response) => {
  
  try {
    const Title: string = req.body.Title;
    const Start: Date   = new Date(req.body.Start);
    const End: Date     = new Date(req.body.End);
    const Notes: string = req.body.Notes;
    
    const result = await prisma.event.create({
      data: {
        Title,
        Start,
        End,
        Notes
      },
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

export { router as events }