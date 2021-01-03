import { Router, Request, Response, query } from 'express';
import { nanoid } from 'nanoid';
import { authentication } from '../middleware/auth.middleware';
import {
    addCity,
    addDistrict,
    queryCars,
    updateCity,
    updateDistrict
} from '../fabric/car/Car.fabric';

const router = Router();


router.post('/', authentication, async (request: Request, response: Response) => {
    try {
        const {city, districts} = request.body;
        city.id = "C"+ nanoid().toUpperCase();
        const results = await addCity(request.user.id, city);
        console.log(results);
        for (let i = 0; i < districts.length; i++) {
            districts[i].id = "D" + nanoid().toUpperCase();
            districts[i].city = city.id;
            await addDistrict(request.user.id, districts[i]);
        }
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})

router.put('/', authentication, async (request: Request, response: Response) => {
    try {
        const {city, districts} = request.body;
        const results = await updateCity(request.user.id, city);
        for (let i = 0; i < districts.length; i++) {
            if (typeof districts[i].id === 'undefined') {
                districts[i].id = "D" + nanoid();
                districts[i].city = city.id;
                districts[i].docType = 'district'
            }

            await updateDistrict(request.user.id, districts[i]);
        }
        response.send({success: true});
    } catch (error) {
        response.send({success: false});
    }
})

router.get('/', authentication, async (request: Request, response: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'city',
            ...request.query
        }
        if(request.query.number) {
            queryString.selector.number = {
                $elemMatch: {
                    $eq: request.query.number
                }
            };
        }
        if(request.query.id) {
            delete queryString.selector.id;
            queryString.selector.$not = {
                id: request.query.id
            }
        }
        const result = await queryCars(request.user.id, JSON.stringify(queryString));
        const resultResponse = await Promise.all(result.map((city: { Record: any; }) => city.Record))
        return response.send(resultResponse);
    } catch (error) {
        console.log(error);
    }
})

router.get('/:cityId/district', authentication, async (req: Request, res: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'district',
            city: req.params.cityId,
        }
        const result = await queryCars(req.user.id, JSON.stringify(queryString));
        const resultResponse = await Promise.all(result.map((district: { Record: any; }) => district.Record))
        return res.send(resultResponse);
    } catch (error) {
        console.log(error);
        res.sendStatus(403);
    }
})

export default router;