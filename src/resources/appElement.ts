import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient()
const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.get('/', async (req: Request, res: Response) => {
    const appElements = await prisma.appElement.findMany({
    })
    res.json(appElements)
})

router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const appElements = await prisma.appElement.findUnique({
        where: {
            id: Number(id),
        },
    })
    res.json(appElements)
})

router.post('/', async (req: Request, res: Response) => {
    try {
        const elementName: string = req.body.name;
        const result = await prisma.appElement.create({
            data: {
                elementName,
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
        const elementName: string = req.body.name;
        const result = await prisma.appElement.update({
            where: {
                id: Number(id),
            },
            data: {
                elementName,
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
        const appElement = await prisma.appElement.delete({
            where: {
                id: Number(id),
            },
        })
        res.json(appElement)
    } catch (e: any) {
        res.send(e.code)
    }
})

export { router as appElements }