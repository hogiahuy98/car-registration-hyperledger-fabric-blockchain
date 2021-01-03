import { Router, Request, Response, request } from 'express';
import moment from 'moment';
import {registryCar,
        getAllCars,
        getProcesscingCars,
        acceptCarRegistration,
        rejectCarRegistration,
        getCarById,
        isOwnerOfCar, 
        requestChangeOwner,
        queryCars,
        getHistoryOfCar,
        approveTransferDeal,
        updateRegistration,
        confirmTransferDeal,
        rejectTransferDeal,
        Car,
        getCity,
        getDistrict,
} from '../fabric/car/Car.fabric';
import { nanoid } from 'nanoid';
import { authentication } from '../middleware/auth.middleware';
import { getUserById } from '../fabric/user/User.fabric';
import randomstring from 'randomstring';

const router = Router();

// /car/ POST
router.post('/', authentication, async (req: Request, res: Response) => {
    try {
        const userId = req.user.id;
        const car: Car = {
            id: 'C' + nanoid().toUpperCase(),
            brand: req.body.brand,
            color: req.body.color,
            model: req.body.model,
            year: req.body.year,
            owner: req.user.id,
            chassisNumber: req.body.chassisNumber,
            engineNumber: req.body.engineNumber,
            capality: req.body.capality,
            registrationCity: req.body.registrationCity,
            registrationDistrict: req.body.registrationDistrict,
        }
        const registryResult = await registryCar(car, userId);
        return res.json({ ...registryResult });
    } catch (error) {
        res.sendStatus(400);
    }
})

router.get('/', authentication, async (req: Request, res: Response) => {
    const id = req.user.id;
    const cars = await getAllCars(id);
    if(!cars.result.cars || cars.result.cars.length === 0) return res.sendStatus(404)
    const result = await Promise.all(cars.result.cars.map(async (state: { Record: any; }) => {
        const car = state.Record;
        const user = await getUserById(car.owner);
        delete user.password
        car.owner = user;
        return car;
    }))
    res.json(result);
});


router.get('/checkEngineNumber', authentication, async (req: Request, res: Response) => {
    const engineNumber = req.query.en;
    const queryString: any = {};
    queryString.selector = {
        docType: 'car',
        engineNumber,
        $not: {
            registrationState: 'rejected'
        }
    }
    try {
        const results = await queryCars(req.user.id, JSON.stringify(queryString));
        if (results.length === 0) {
            return res.send({ valid: true});
        }
        else return res.send({ valid: false });
    } catch (error) {
        console.log(error);
        return res.send( { valid: false });
    }
})


router.get('/checkChassisNumber', authentication, async (req: Request, res: Response) => {
    const chassisNumber = req.query.cn;
    const queryString: any = {};
    queryString.selector = {
        docType: 'car',
        chassisNumber: chassisNumber,
        $not: {
            registrationState: 'rejected',
        }
    }
    try {
        const results = await queryCars(req.user.id, JSON.stringify(queryString));
        if (results.length === 0) {
            return res.send({ valid: true});
        }
        else return res.send({ valid: false });
    } catch (error) {
        console.log(error);
        return res.send( { valid: false });
    }
});

router.get('/pending', authentication, async (req: Request, res: Response) => {
    if (req.user.role !== "police") {
        return res.sendStatus(401);
    }
    const identityCardNumber = req.user.identityCardNumber;
    const queryResult = await getProcesscingCars(identityCardNumber);
    if (!queryResult.success) {
        return res.status(404);
    }
    return res.json(queryResult.result);
});

router.get('/transfers', authentication, async (req: Request, res: Response) => {
    const queryString: any = {};
    queryString.selector = {
        docType: 'transfer',
    }
    const result = await queryCars(req.user.id, JSON.stringify(queryString));
    console.log(result);
    res.json(result);
});


router.post('/transfer/:dealId/approveTransfer/', authentication, async (req: Request, res: Response) => {
    try {
        const TxID = await approveTransferDeal(req.user.id, req.params.dealId);
        if(typeof TxID === 'undefined') return res.send({ success: false })
        else return res.send({ success: true, TxID})
    } catch (error) {
        console.log(error);
        return res.send({ success: false });
    }
})


router.post('/transfer/:dealId/confirmTransfer/', authentication, async (req: Request, res: Response) => {
    try {
        const TxID = await confirmTransferDeal(req.user.id, req.params.dealId);
        if(typeof TxID === 'undefined') return res.send({ success: false })
        else return res.send({ success: true, TxID})
    } catch (error) {
        console.log(error);
        return res.send({ success: false });
    }
})

router.post('/transfer/:dealId/rejectTransfer', authentication, async (req: Request, res:Response) => {
    try {
        const TxID = await rejectTransferDeal(req.user.id, req.params.dealId);
        if (typeof TxID === 'undefined') return res.send({ success: false })
        else return res.send({ success: true, TxID})
    } catch (error) {
        console.log(error);
        return res.send({ success: false });
    }
})


router.get('/:id', authentication, async (req: Request, res: Response) => {
    const queryString: any = {};
    queryString.selector = {
        docType: 'car',
        id: req.params.id
    }
    const result = await queryCars(req.user.id, JSON.stringify(queryString));
    res.json(result[0]);
});

const getCar = async (id: any) => {
    const queryString: any = {};
    queryString.selector = {
        docType: 'car',
        id: id
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record;
}

router.get('/:id/transferDeal', authentication, async (req: Request, res: Response) => {
    try {
        const queryString: any = {};
        queryString.selector = {
            docType: 'transfer',
            carId: req.params.id,
            $or: [
                { state: 0 },
                { state: 1 },
            ],
        }
        const result = await queryCars(req.user.id, JSON.stringify(queryString));
        const deal = result[0].Record;
        const currentOwner = await getUserById(deal.currentOwner);
        const newOwner = await getUserById(deal.newOwner);
        const car = await getCarById(req.user.id,deal.carId);
        deal.currentOwner = currentOwner;
        deal.newOwner = newOwner;
        deal.car = car.Record;
        return res.send(deal);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
});


router.put('/:id', authentication, async (req: Request, res: Response) => {
    try {
        const payload = req.body;
        const result  = await updateRegistration(req.user.id, req.params.id, payload);
        if (!result.error) return res.send({success: true});
        else return res.send({success: false, error: result.error});
    } catch (error) {
        return res.send({success: false, error: 'Fabric error'});
    }
})


router.get('/:id/history', authentication, async (req: Request, res: Response) => {
    const id = req.user.id;
    const carHistory = await getHistoryOfCar(id, req.params.id);
    const result = await Promise.all(carHistory.map( async (state: any) => {
        const queryString: any = {};
        queryString.selector = {
            docType: 'user',
            id: state.Value.modifyUser,
        }
        const result = await queryCars(id, JSON.stringify(queryString));
        queryString.selector = {
            docType: 'user',
            id: state.Value.owner,
        }
        const result2 = await queryCars(id, JSON.stringify(queryString));
        state.Value.modifyUser = result[0].Record;
        state.Value.owner = result2[0].Record;
        return state
    }))
    res.send(result);
})


router.put('/:id/acceptRegistration/', authentication, async (req: Request, res: Response) => {
    try {
        if (req.user.role !== 'police') {
            return res.sendStatus(401);
        }
        const id = req.user.id;
        let validNumber = false;
        let registrationNumber = "";
        const car = await getCar(req.params.id);
        console.log(car);
        const city = await getCity(car.registrationCity);
        const district = await getDistrict(car.registrationDistrict);
        const prefix = city.number[district.numberIndex] + city.series[district.seriesIndex] + '-';
        console.log(prefix)
        while (!validNumber){
            registrationNumber = randomstring.generate({
                length: 5,
                charset: 'numeric'
            });
            const queryString: any = {}
            queryString.selector = {
                docType: 'car',
                registrationNumber: prefix + registrationNumber
            }
            const result = await queryCars(id, JSON.stringify(queryString));
            if(result.length === 0)  validNumber = true;
        }
        const acceptRegistrationResult = await acceptCarRegistration(req.params.id, prefix + registrationNumber, id);
        if (!acceptRegistrationResult.success) {
            return res.sendStatus(403);
        }
        else {
            return res.json({ TxID: acceptRegistrationResult.result.TxID, error: false});
        }
    } catch (error) {
        console.log(error);
        res.send({error: true});
    }
});


router.put('/:carId/rejectRegistration/', authentication, async (req: Request, res: Response) => {
    // if (req.user.role !== 'police') {
    //     return res.sendStatus(401);
    // }
    const id = req.user.id;
    const acceptRegistrationResult = await rejectCarRegistration(req.params.carId, id);
    if (!acceptRegistrationResult.success) {
        return res.sendStatus(403);
    }
    else {
        return res.json({ TxID: acceptRegistrationResult.result.TxID });
    }
});



router.post('/:carId/transferOwnership', authentication, async (req: Request, res: Response) =>{
    const carId = req.params.carId;
    const userId = req.user.id;
    const newOwner = req.body.newOwner;
    const isOwnerCar = await isOwnerOfCar(req.params.carId, req.user.id);
    if (!isOwnerCar.result.isOwner) return res.sendStatus(401);
    
    const requestResult = await requestChangeOwner(carId, newOwner, userId);

    if(requestResult.success) return res.send(requestResult.result)
    else return res.sendStatus(403);
});





export default router;