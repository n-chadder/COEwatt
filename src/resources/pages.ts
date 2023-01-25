import * as express from "express";
import { Request, Response, NextFunction} from "express";
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient()
const router = express.Router()

// middleware that is specific to this router
router.use((req:Request, res:Response, next: NextFunction) => {
    console.log('Time: ', Date.now())
    next()
})

router.get('/', async (req: Request, res: Response) => {
    const roles = await prisma.role.findMany({
    })
    res.json(roles)
})

router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const roles = await prisma.role.findUnique({
        where: {
            id: Number(id),
        },
    })
    res.json(roles)
})

router.post('/', async (req: Request, res: Response) => {
    try {
        const name: string = req.body.name;
        const result = await prisma.role.create({
            data: {
                name,
            },
        })
        res.json(result)
    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // If it exists, no hard no foul. Say nothing.
            if (e.code === 'P2002') {
                console.log(
                    'There is a unique constraint violation, a new user cannot be created with this email'
                )
            }
            res.json(req.body);
        }
    }

})

router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const name: string = req.body.name;
        const result = await prisma.role.update({
            where: {
                id: Number(id),
            },
            data: {
                name,
            },
        })
        res.json(result)
    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // If it exists, no hard no foul. Say nothing.
            if (e.code === 'P2002') {
                console.log(
                    'There is a unique constraint violation, a new user cannot be created with this email'
                )
            }
            res.json(req.body);
        }
    }

})

router.delete('/:id', async (req: any, res: any) => {
    try {
        const id = req.params.id
        const role = await prisma.role.delete({
            where: {
                id: Number(id),
            },
        })
        res.json(role)
    } catch (e: any) {
        res.send(e.code)
    }
})

export { router as roles }