import { Request, Response, NextFunction } from "express";
import { PrismaClient, Prisma } from '@prisma/client';

const prisma = new PrismaClient()

const isAuth = async (req: Request, res: Response, next: NextFunction) => {
    // const auth = req.headers.authorization; // SessionId
    // // Use sessionid - not expired then next, else 401
    // const roles = await prisma.user.findUnique({
    //     where: {
    //         id: Number(id),
    //     },
    // })

    // if (auth === 'password') {
    //     next();
    // } else {
    //     res.status(401);
    //     res.send('Access forbidden');
    // }
    res.status(401);
    res.send('Access forbidden');
}

export { isAuth }