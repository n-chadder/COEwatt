import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from '@prisma/client';
import { isAuth } from './helpers/auth';

const prisma = new PrismaClient()
const router = express.Router()

// function isAuth(req: Request, res: Response, next: NextFunction) {
//     const auth = req.headers.authorization;
//     if (auth === 'password') {
//         next();
//     } else {
//         res.status(401);
//         res.send('Access forbidden');
//     }
// }

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.get('/', async (req: Request, res: Response) => {
    const versions = await prisma.version.findMany({
    })
    res.json(versions)
})

router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const versions = await prisma.version.findUnique({
        where: {
            id: Number(id),
        },
    })
    res.json(versions)
})

router.post('/', async (req: Request, res: Response) => {
    try {
        const Version: string = req.body.version;
        const AppId: number = req.body.appId;
        const result = await prisma.version.create({
            data: {
                AppId,
                Version,
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
        const Version: string = req.body.version;
        const AppId: number = req.body.appId;
        const result = await prisma.version.update({
            where: {
                id: Number(id),
            },
            data: {
                AppId,
                Version,
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
        const version = await prisma.version.delete({
            where: {
                id: Number(id),
            },
        })
        res.json(version)
    } catch (e: any) {
        res.send(e.code)
    }
})

export { router as versions }