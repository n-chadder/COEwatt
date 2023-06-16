import * as express from "express";
import { Request, Response, NextFunction} from "express";
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient()
const router = express.Router()

// middleware that is specific to this router
router.use((req:Request, res:Response, next: NextFunction) => {
  console.log('Time: ', Date.now())
  next()
});

router.get('/', async (req: Request, res: Response) => {
  if (req.query.appID) {
    try {
      let pages = await prisma.page.findMany({
        where: {
          AppID: {
            equals: Number(req.query.appID),
          },
        },
      });
      res.status(200).json(pages);
    } 
    catch (e: any) {
      res.status(500).json(e);
    }
  }
  else {
    let pages = await prisma.page.findMany({});
    res.status(200).json(pages);
  }
});

router.get('/:id', async (req: Request, res: Response) => {
  const id = req.params.id;
  try {
    const page = await prisma.page.findUnique({
      where: {
        id: Number(id),
      },
    });
    res.status(200).json(page);
  }
  catch (e: any){
    res.status(404).json({});
  }
});

router.post('/', async (req: Request, res: Response) => {
  
  try {
    const URL: string = req.body.URL;
    const Title: string = req.body.Title;
    const Action: string = req.body.Action;
    const NeedAuth: boolean = (req.body.NeedAuth == "on") ? true : false;
    const App: number = Number(req.body.App);
    const result = await prisma.page.create({
      data: {
        URL,
        Title,
        Action,
        NeedAuth,
        App: {
          connect: { id: App},
        }
      },
    });
    res.format({
      'application/json': function(){
        res.status(200).json(result);
      },
      'text/html': function(){
        req.flash("success", "Page was added successfully");
        res.redirect('/applications');
      }
    });
  } 
  catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // If it exists, no hard no foul. Say nothing.
      if (e.code === 'P2002') {
        console.log(
          'There is a unique constraint violation, a new user cannot be created with this email'
        )
      }
    }
    res.format({
      'application/json': function(){
        res.status(500).json(req.body);
      },
      'text/html': function(){
        req.flash("error", "Something went wrong, page could not be added");
        res.redirect('/applications');
      }
    });
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const URL: string = req.body.URL;
    const Title: string = req.body.Title;
    const Action: string = req.body.Action;
    const NeedAuth: boolean = (req.body.NeedAuth == "on") ? true : false;
    const App: number = Number(req.body.App);

    const result = await prisma.page.update({
      where: {
        id: Number(id),
      },
      data: {
        URL,
        Title,
        Action,
        NeedAuth,
        App: {
          connect: { id: App},
        }
      },
    });

    res.format({
      'application/json': function(){
        res.status(200).json(result);
      },
      'text/html': function(){
        req.flash("success", "Page was edited successfully");
        res.redirect('/applications');
      }
    });
  } 
  catch (e: any) {
    if (e instanceof Prisma.PrismaClientKnownRequestError) {
      // If it exists, no hard no foul. Say nothing.
      if (e.code === 'P2002') {
        console.log(
          'There is a unique constraint violation, a new user cannot be created with this email'
        )
      }
    }
    res.format({
      'application/json': function(){
        res.status(500).json(req.body);
      },
      'text/html': function(){
        req.flash("error", "Something went wrong, page could not be edited");
        res.redirect('/applications');
      }
    });
  }
});

router.delete('/:id', async (req: any, res: any) => {
  try {
    const id = req.params.id
    const result = await prisma.page.delete({
      where: {
        id: Number(id),
      },
    });
    res.format({
      'application/json': function(){
        res.status(200).json(result);
      },
      'text/html': function(){
        req.flash("success", "Page was deleted successfully");
        res.redirect('/applications');
      }
    });
  } 
  catch (e: any) {
    res.format({
      'application/json': function(){
        res.status(200).json(e);
      },
      'text/html': function(){
        req.flash("error", "Something went wrong, page could not be deleted");
        res.redirect('/applications');
      }
    });
  }
});

export { router as pages }