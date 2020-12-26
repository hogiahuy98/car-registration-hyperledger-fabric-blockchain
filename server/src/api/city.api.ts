import { Router, Request, Response } from 'express';
import { nanoid } from 'nanoid';
import { authentication } from '../middleware/auth.middleware';
import {
    addCity,
    queryCars
} from '../fabric/car/Car.fabric';

const router = Router();


router.post('/', authentication, async (request: Request, response: Response) => {
    try {
        console.log(request.body);
        const results = await addCity(request.user.id, request.body);
        console.log(results);
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})

router.get('/', authentication, async (request: Request, response: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'city'
        }
        const result = await queryCars(request.user.id, JSON.stringify(queryString));
        return response.send(result);
    } catch (error) {
        console.log(error);
    }
})

export default router;