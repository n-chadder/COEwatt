import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from '@prisma/client';
import * as pug from "pug";

// Compiled pug templates
const compiledBase = pug.compileFile("src/static/base.pug");
const compiledApplicationList = pug.compileFile("src/static/application_list.pug");
const compiledApplicationDetail = pug.compileFile("src/static/application_details.pug");
const compliedAddApplication = pug.compileFile("src/static/add_application.pug");


const prisma = new PrismaClient()
const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.get('/', async (req: Request, res: Response) => {
    const applications = await prisma.application.findMany({
    })
    res.format({
        'application/json': function(){
            res.status(200).json(applications);
            return;
        },
        'text/html': function(){
            let page = compiledApplicationList({applications});
            res.status(200).send(page);
            return;
        }
    });
})

router.get('/addform', (req: Request, res: Response) => {
    let page = compliedAddApplication({});
    res.status(200).send(page);
})


router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const applications = await prisma.application.findUnique({
        where: {
            id: Number(id),
        },
    })
    res.format({
        'application/json': function(){
            res.status(200).json(applications);
            return;
        },
        'text/html': function(){
            if (!applications) {
                res.status(404).json(applications);
                // 404 page here
                return;
            }
            let page = compiledApplicationList({applications});
            res.status(200).send(page);
            return;
        }
    });
})

// Name    String
// Desc    String
// Owner   Int

router.post('/', async (req: Request, res: Response) => {
    console.log(req.body);
    return;
    
    try {
        const Name: string = req.body.name;
        const Desc: string = req.body.Desc;
        const Owner: number = req.body.OwnerId;
        const result = await prisma.application.create({
            data: {
                Name,
                Desc,
                Owner
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
        const Name: string = req.body.name;
        const Desc: string = req.body.Desc;
        const Owner: Number = req.body.OwnerId;
        const result = await prisma.application.update({
            where: {
                id: Number(id),
            },
            data: {
                Name,
                Desc
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
        const application = await prisma.application.delete({
            where: {
                id: Number(id),
            },
        })
        res.json(application)
    } catch (e: any) {
        res.send(e.code)
    }
})

export { router as applications }