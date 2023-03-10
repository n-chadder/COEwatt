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
  const pages = await prisma.page.findMany({});
  res.json(pages);
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
    const Auth: string = req.body.Auth;
    const App: number = Number(req.body.App);
    const result = await prisma.page.create({
      data: {
        URL,
        Title,
        Action,
        Auth,
        App: {
          connect: { id: App},
        } 
      },
    });
    res.json(result)
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
    res.status(500).json(req.body);
  }
});

router.patch('/:id', async (req: Request, res: Response) => {
  try {
    const id = req.params.id;
    const URL: string = req.body.URL;
    const Title: string = req.body.Title;
    const Action: string = req.body.Action;
    const Auth: string = req.body.Auth;
    const App: number = Number(req.body.App);
    const result = await prisma.page.update({
      where: {
        id: Number(id),
      },
      data: {
        URL,
        Title,
        Action,
        Auth,
        App: {
          connect: { id: App},
        } 
      },
    });
    res.status(200).json(result);
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
    res.status(500).json(req.body);
  }

});

router.delete('/:id', async (req: any, res: any) => {
  try {
    const id = req.params.id
    const role = await prisma.page.delete({
      where: {
        id: Number(id),
      },
    });
    res.json(role)
  } 
  catch (e: any) {
    res.send(e.code)
  }
});

export { router as pages }