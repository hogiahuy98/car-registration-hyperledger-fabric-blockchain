import express, { Application, Request, Response, NextFunction } from "express";
import * as bodyParser from "body-parser";
import userRouter from './api/user.api';
import carRouter from './api/car.api';
import authRouter from './api/auth.api';
import * as dotenv from 'dotenv';
import cors from 'cors';
// import { authentication } from './middleware/auth.middleware'

declare global {
    namespace Express {
      interface Request {
        user?: any
      }
    }
}


const app: Application = express();

dotenv.config()
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));
app.use(cors());
// app.use(authentication);

app.use('/users', userRouter);
app.use('/cars', carRouter);
app.use('/auth', authRouter)

app.get("/test", (req: Request, res: Response) => {
    res.status(200).send("Hello World!");
});

app.listen(3000, () =>{
    console.log("Started CR server")
});