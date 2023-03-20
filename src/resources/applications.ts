import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from '@prisma/client';
import * as pug from "pug";

// Compiled pug templates
const compiledBase = pug.compileFile("src/static/base.pug");
const compiledApplicationList = pug.compileFile("src/static/application_list.pug");

const prisma = new PrismaClient()
const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.get('/', async (req: Request, res: Response) => {

    const applications = await prisma.application.findMany({
    });

    applications.sort((a,b) => {

        if(a.Name.toUpperCase() < b.Name.toUpperCase()) {
            return -1;
        } else {
            return 0;
        }
    })

    let success = req.flash('success');
    let error   = req.flash('error'); 
    let result = {
        "applications": applications,
        "success" : success,
        "error" : error
    }  
    
    res.format({
        'application/json': function(){
            res.status(200).json(applications);
            return;
        },
        'text/html': function(){
            let page = compiledApplicationList({result});
            res.status(200).send(page);
            return;
        }
    });
})

router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    // this should probably be a try catch block
    const application = await prisma.application.findUnique({
        where: {
          id: Number(id),
        },
        include: {
          Events: true,
          Pages: true,
        },
    });

    res.status(200).json(application);
});

// Name    String
// Desc    String
// Owner   String

router.post('/', async (req: Request, res: Response) => {

    try {
        const Name: string = req.body.Name;
        const Desc: string = req.body.Desc;
        const Owner: string = req.body.Owner;
        const result = await prisma.application.create({
            data: {
                Name,
                Desc,
                Owner
            },
        });
        res.format({
            'application/json': function(){
                res.status(200).json(result);
                return;
            },
            'text/html': function(){
                req.flash("success", "Application was created successfully");
                res.redirect(`/applications`);
                return;
            }
        });
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
        const Name: string = req.body.Name;
        const Desc: string = req.body.Desc;
        const Owner: string = req.body.Owner;
        const result = await prisma.application.update({
            where: {
                id: Number(id),
            },
            data: {
                Name,
                Desc, 
                Owner
            },
        })
        res.format({
            'application/json': function(){
                res.status(200).json(result);
                return;
            },
            'text/html': function(){
                req.flash("success", "Application was edited successfully");
                res.redirect(`/applications`);
                return;
            }
        });
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
        res.format({
            'application/json': function(){
                res.status(200).json(application);
                return;
            },
            'text/html': function(){
                req.flash('success', 'Application was deleted successfully');
                res.redirect(`/applications`);
                return;
            }
        });
    } catch (e: any) {
        res.send(e.code)
    }
})

export { router as applications }