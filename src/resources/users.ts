import * as bcrypt from 'bcrypt';

import * as express from "express";
import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from '@prisma/client';


// function isAuth(req: Request, res: Response, next: NextFunction) {
//     const auth = req.headers.authorization; // SessionId
//     // Use sessionid - not expired then next, else 401
//     if (auth === 'password') {
//         next();
//     } else {
//         res.status(401);
//         res.send('Access forbidden');
//     }
// }

const prisma = new PrismaClient()
const router = express.Router()

// middleware that is specific to this router
router.use((req, res, next) => {
    console.log('Time: ', Date.now())
    next()
})

router.get('/', async (req: Request, res: Response) => {
    const users = await prisma.user.findMany({
    })
    res.json(users)
})

router.get('/:id', async (req: Request, res: Response) => {
    const id = req.params.id;
    const user = await prisma.user.findUnique({
        where: {
            id: Number(id),
        },
    })
    res.json(user)
})

router.post('/login', async (req: Request, res: Response) => {

    const userName: string = req.body.userName;
    const password: string = req.body.password;

    // Get the hashed password for the username

    // Check it with const verified = bcrypt.compareSync(password, password_hash);

    // if verified then generate a session id and store in the database with an expirey and userid

    // Goto home page with sessionid in the header as an auth key, and sessionid in a cookie.


})

router.post('/logout', async (req: Request, res: Response) => {

    const userName: string = req.body.userName;
    const password: string = req.body.password;

    // Get the hashed password for the username

    // Check it with const verified = bcrypt.compareSync(password, password_hash);

    // if verified then generate a session id and store in the database with an expirey and userid

    // Goto home page with sessionid in the header as an auth key, and sessionid in a cookie.


})

router.post('/', async (req: Request, res: Response) => {
    try {
        const firstName: string = req.body.firstName;
        const lastName: string = req.body.lastName;
        const email: string = req.body.email;
        // see https://javascript.plainenglish.io/how-to-verify-hashed-passwords-in-nodejs-and-mysql-26fedcfee01f

        const password: string = bcrypt.hashSync(req.body.password, 10);
        const result = await prisma.user.create({
            data: {
                firstName,
                lastName,
                email,
                password
            },
        })
        res.json(result)
        // res.send(password)
    } catch (e: any) {
        if (e instanceof Prisma.PrismaClientKnownRequestError) {
            // If it exists, no hard no foul. Say nothing.
            if (e.code === 'P2002') {
                console.log(
                    'There is a unique constraint violation.'
                )
            }
            res.json(req.body);
        }
    }

})

router.patch('/:id', async (req: Request, res: Response) => {
    try {
        const id = req.params.id;
        const firstName: string = req.body.firstName;
        const lastName: string = req.body.lastName;
        const email: string = req.body.email;
        const result = await prisma.user.update({
            where: {
                id: Number(id),
            },
            data: {
                firstName,
                lastName,
                email
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
        const role = await prisma.user.delete({
            where: {
                id: Number(id),
            },
        })
        res.json(role)
    } catch (e: any) {
        res.send(e.code)
    }
})

export { router as users }