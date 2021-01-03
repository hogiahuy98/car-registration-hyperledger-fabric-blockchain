import { Router, Request, Response } from 'express';
import { User, queryUser, modifyUser, verifyUser, changePassword } from '../fabric/user/User.fabric';
import { authentication } from '../middleware/auth.middleware';
import { queryCars, getCity, getDistrict } from '../fabric/car/Car.fabric';
import * as bcrypt from 'bcrypt';
import { parse } from 'dotenv/types';

const router = Router();

const jwt_secret = process.env.JWT_SECRET || "blockchain";
const uidLen = 8;

router.get('/', authentication, async (req: Request, res: Response) => {
    if(req.user.role !== 'police' && req.user.role !== 'admin') return res.status(403);
    const queryString: any = {};
    queryString.selector = {
        docType: 'user',
    }
    if(req.user.role === 'police') queryString.selector.role = 'citizen';
    else queryString.selector.$or = [
        {role: 'citizen'},
        {role: 'police'}
    ]
    try {
        const users = await queryUser(req.user.id, JSON.stringify(queryString));
        const response = users.map((user: { Record: any; }) => {
            if (user.Record.role === 'police') {
                user.Record.phoneNumber = user.Record.phoneNumber.substring(2, user.Record.phoneNumber.length)
            }
            return user.Record;
        });
        return res.send(response);
    } catch (error) {
        console.log(error);
        res.sendStatus(404);
    }
})

router.get('/me', authentication, async (req: Request, res: Response) => {
    res.send(req.user);
});

router.put('/me/changePassword', authentication, async (req: Request, res: Response) => {
    try {
        const {newPassword} = req.body;
        const result = await changePassword(req.user.id, bcrypt.hashSync(newPassword, 5));
        if(result.TxID) return res.send({success: true});
        return res.send({success: false})
    } catch (error) {
        console.log(error);
        return res.send({success: false})
    }
})

router.get('/validateChangeOwner', authentication, async (req: Request, res: Response) => {
    const newOnwerId = req.query.id;
    if (typeof newOnwerId === 'undefined') return res.sendStatus(403);
    const queryString: any = {};
    queryString.selector = {
        docType: 'user',
        id: newOnwerId,
    }
    try {
        const result = await queryUser(req.user.id, JSON.stringify(queryString));
        if(result.length > 0) return res.json({valid: true, newOwnerId: result[0].Record.id});
        else return res.json({valid: false});
    } catch (error) {
        console.log(error);
        return res.status(403);
    }
});

router.get('/validate/', async (req: Request, res: Response) => {
    const {field, value} = req.query;
    if (typeof field === 'undefined' && typeof value === 'undefined') return res.send({valid: false});
    const queryString: any = {};
    queryString.selector = {
        docType: 'user',
    }
    queryString.selector[field?field.toString():''] = value;
    try{
        const result = await queryUser('admin', JSON.stringify(queryString));
        if (result.length === 0) return res.send({valid: true});
        return res.send({valid: false});
    } catch(error) {
        return res.send({valid: false});
    }
});

router.get('/validatePolice/', async (req: Request, res: Response) => {
    const {field, value} = req.query;
    if (typeof field === 'undefined' && typeof value === 'undefined') return res.send({valid: false});
    const queryString: any = {};
    queryString.selector = {
        docType: 'user',
        role: 'police'
    }
    queryString.selector[field?field.toString():''] = value;
    try{
        const result = await queryUser('admin', JSON.stringify(queryString));
        if (result.length === 0) return res.send({valid: true});
        return res.send({valid: false});
    } catch(error) {
        return res.send({valid: false});
    }
});

router.get('/:id', authentication, async (req: Request, res: Response) => {
    const queryResult: any = {}
    queryResult.selector = {
        docType: 'user',
        id: req.params.id
    }
    const result = await queryUser(req.user.id, JSON.stringify(queryResult));
    res.json(result[0]);
});

router.put('/:id', authentication, async (req: Request, res: Response) => {
    const user = req.body;
    user.id = req.params.id;
    const result = await modifyUser(req.user.id, user);
    if(result.TxID) return res.send({success: true});
    return res.send({success: false});
})


router.put('/:id/verify', authentication, async (req: Request, res: Response) => {
    if (req.user.role !== 'police' && req.user.role !== 'admin') return res.sendStatus(403); 
    const result = await verifyUser(req.user.id, req.params.id);
    if(result.TxID) return res.send({success: true});
    return res.send({success: false});
})

router.get('/:id/transferRequest', authentication, async (req: Request, res: Response) => {
    const queryResult: any = {}
    queryResult.selector = {
        docType: "transfer",
        newOwner: req.user.id,
        $or: [
            { state: 0 },
            { state: 1 },
        ],
    };
    const result = await queryCars(req.user.id, JSON.stringify(queryResult));
    res.json(result);
})

router.get('/:id/cars/pending', authentication, async (req: Request, res: Response) => {
    try {
        if (req.user.role !== 'police' && req.user.id !== req.params.id){
            res.sendStatus(403);
        }
        const queryString: any = {};
        queryString.selector = {
            docType: 'car',
            owner: req.user.id,
            registrationState: 'pending'
        }
        const queryResult = await queryCars(req.user.id, JSON.stringify(queryString));
        const car = queryResult[0].Record;
        car.registrationCity = await getCity(car.registrationCity);
        car.registrationDistrict = await getDistrict(car.registrationDistrict)
        res.json(car);
    } catch (error) {
        console.log(error);
        res.send({error: true, msg: error.message});
    }
})

router.get('/:id/cars/registered', authentication, async (req: Request, res: Response) => {
    try {
        if (req.user.role !== 'police' && req.user.id !== req.params.id){
            res.sendStatus(403);
        }
        const queryString: any = {};
        queryString.selector = {
            docType: 'car',
            owner: req.user.id,
            $or: [
                {registrationState: 'registered'},
                {registrationState: 'transferring_ownership'}
            ]
        }
        const result = await queryCars(req.user.id, JSON.stringify(queryString));
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({error: true, msg: error.message});
    }
})


router.get('/:id/cars/transferring', authentication, async (req: Request, res: Response) => {
    try {
        if (req.user.role !== 'police' && req.user.id !== req.params.id){
            res.sendStatus(403);
        }
        const queryString: any = {};
        queryString.selector = {
            docType: 'transfer',
            currentOwner: req.params.id,
            state: 0
        }
        const result = await queryCars(req.user.id, JSON.stringify(queryString));
        if (result.length > 0) {
            const userQuery: any = {};
            userQuery.selector = {
                docType: 'user',
                id: result[0].Record.newOwner
            }
            const newOwner = await queryUser(req.user.id, JSON.stringify(userQuery));
            if (newOwner.length > 0) {
                delete newOwner[0].Record.password;
                result[0].Record.newOwner = newOwner[0].Record;
            }
        }
        res.json(result);
    } catch (error) {
        console.log(error);
        res.json({error: true, msg: error.message});
    }
})




export default router; 