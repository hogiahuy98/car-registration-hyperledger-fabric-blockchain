import { Contract ,Context } from 'fabric-contract-api';
import { Car, TransferOffer } from './Car';
import { User } from '../User/User';
import cars from './cars';
import { City, District } from './city';


const DOCTYPE = 'car';
const PENDING_REGISTRATION_NUMBER = 'none';
const REGISTRATION_STATE = {
    PENDING: 'pending',
    REGISTERED: 'registered',
    REJECTED: 'rejected',
    TRANSFERRING_OWNERSHIP: 'transferring_ownership'
}
const CHANGE_OWNER_STATE = {
    PENDING: 0,
    APPROVED: 1,
    CONFIRMED: 2,
    REJECTED: 3,
}

const MODIFY_TYPE = {
    REGISTRY: 0,
    COMPLETE_REGISTRATION: 1,
    CANCEL_REGISTRATION: 2,
    CHANGE_OWNER: 3,
    UPDATE_CAR: 4,
    CONFIRM_TRANSFER: 5,
    APPROVED_TRANSFER: 6,
    CANCEL_TRANSFER: 7
}

const CONTRACT_NAME = 'car';
const BOOLEAN_STRING = {
    true: 'true',
    false: 'false',
}

export class CarContract extends Contract {

    constructor(){
        super(CONTRACT_NAME);
    }

    public async createRegistration(ctx: Context, ...params: string[]): Promise<string>{
        try {
            const car: Car = {
                id: params[0],
                registrationNumber: PENDING_REGISTRATION_NUMBER,
                engineNumber: params[1],
                chassisNumber: params[2],
                brand: params[3],
                model: params[4],
                color: params[5],
                year: params[6],
                capality: params[7],
                owner: params[8],
                registrationCity: params[9],
                registrationDistrict: params[10],
                registrationState: REGISTRATION_STATE.PENDING,
                createTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
                modifyTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
                modifyType: 0,
                modifyUser: this.getUserId(ctx),
                docType: DOCTYPE,
            };
            await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
            return JSON.stringify({
                TxID: ctx.stub.getTxID(),
                regId: car.id,
            })
        } catch (error) {
            console.log(error);
            return "";
        }
    }

    public async updateRegistration(ctx: Context, carId: string, payload: string){
        try {
            const carAsBytes = await ctx.stub.getState(carId);
            const newInfo = JSON.parse(payload);
            const car = JSON.parse(carAsBytes.toString());
            const updateCar: Car = {...car, ...newInfo};
            updateCar.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
            updateCar.modifyType = MODIFY_TYPE.UPDATE_CAR;
            updateCar.modifyUser = this.getUserId(ctx);
            await ctx.stub.putState(updateCar.id, Buffer.from(JSON.stringify(updateCar)));
            return {error: null};
        } catch (error) {
            return {error: error}
        }
    }


    public async acceptRegistration(ctx: Context,  carId: string, registrationNumber: string): Promise<string> {
        const carAsBytes = await ctx.stub.getState(carId);
        let car: Car;
        try {
            car = JSON.parse(carAsBytes.toString());
        } catch (error) {
            return "";
        }
        car.processedPolice = this.getUserId(ctx);
        car.registrationNumber = registrationNumber;
        car.registrationState = REGISTRATION_STATE.REGISTERED;
        car.registrationTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyType = MODIFY_TYPE.COMPLETE_REGISTRATION;
        car.modifyUser = this.getUserId(ctx);
        await ctx.stub.putState(carId, Buffer.from(JSON.stringify(car)));
        return ctx.stub.getTxID();
    }

    public async rejectRegistration(ctx: Context,  carId: string): Promise<string> {
        const carAsBytes = await ctx.stub.getState(carId);
        let car: Car;
        try {
            car = JSON.parse(carAsBytes.toString());
        } catch (error) {
            return "";
        }
        car.processedPolice = this.getUserId(ctx);
        car.registrationState = REGISTRATION_STATE.REJECTED;
        car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyUser = this.getUserId(ctx);
        car.modifyType = MODIFY_TYPE.CANCEL_REGISTRATION;
        await ctx.stub.putState(carId, Buffer.from(JSON.stringify(car)));
        return ctx.stub.getTxID();
    }

    public async deleteCar(ctx: Context, carId) {
        await ctx.stub.deleteState(carId)
    }

    public async queryAllCars(ctx: Context) {
        const queryString: any = { };
        queryString.selector = {
            docType: DOCTYPE,
        };
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        return JSON.parse(queryResult);
    }


    public async queryCarById(ctx: Context, carId: string) {
        try {
            const queryString: any = { };
            queryString.selector = {
                docType: DOCTYPE,
                id: carId
            };
            queryString.use_index = ['_design/indexIdDoc', 'indexId']
            const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
            return JSON.parse(queryResult)[0];
        } catch (error) {
            console.log(error);
            return false;
        }
    }


    public async queryCarByRegistrationNumber(ctx: Context, registrationNumber: string): Promise<string>{
        const queryString: any = {}
        queryString.selector = {
            registrationNumber: registrationNumber,
        }
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        return JSON.parse(queryResult)[0];
    }


    public async queryPendingCarByOwnerPhoneNumber(ctx: Context, phoneNumber: string): Promise<string>{
        const queryString: any = {}
        queryString.selector = {
            onwer: phoneNumber,
            registrationState: REGISTRATION_STATE.PENDING,
        }
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        return JSON.parse(queryResult);
    }


    public async queryAllProcessingCar(ctx: Context): Promise<string>{
        const queryString: any = {}
        queryString.selector = {
            registrationState: REGISTRATION_STATE.PENDING,
        }
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        return JSON.parse(queryResult);
    }


    public async getQueryResultForQueryString(ctx: Context, queryString: string): Promise<string> {
		let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let results = await this.getAllResults(resultsIterator, false);
		return JSON.stringify(results);
	}


    public async queryResult(ctx: Context, queryString: string): Promise<any> {
		let resultsIterator = await ctx.stub.getQueryResult(queryString);
		let results = await this.getAllResults(resultsIterator, false);
		return results;
	}


    public async getAllResults(iterator, isHistory) {
		let allResults = [];
		let res = await iterator.next();
		while (!res.done) {
			if (res.value && res.value.value.toString()) {
				let jsonRes: any = {};
				if (isHistory && isHistory === true) {
					jsonRes.TxId = res.value.tx_id;
					jsonRes.Timestamp = res.value.timestamp;
					try {
						jsonRes.Value = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Value = res.value.value.toString('utf8');
					}
				} else {
					jsonRes.Key = res.value.key;
					try {
						jsonRes.Record = JSON.parse(res.value.value.toString('utf8'));
					} catch (err) {
						console.log(err);
						jsonRes.Record = res.value.value.toString('utf8');
					}
				}
				allResults.push(jsonRes);
			}
			res = await iterator.next();
		}
		iterator.close();
		return allResults;
	}


    private getUserId(ctx: Context): string {
        const rs = ctx.clientIdentity.getID();
        const find = rs.match(/[A-Za-z0-9_-]{22}/);
        if(find === null) return 'admin';
        return find![0];
    }

    public async createTransferOffer(ctx: Context,requestId: string, carId: string, currentOwner: string, newOwner: string): Promise<string> {
        const carAsBytes = await ctx.stub.getState(carId);
        const car: Car = JSON.parse(carAsBytes.toString())
        car.modifyType = MODIFY_TYPE.CHANGE_OWNER;
        car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyUser = currentOwner;
        car.registrationState = REGISTRATION_STATE.TRANSFERRING_OWNERSHIP;
        await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
        const request: TransferOffer = {
            id: requestId,
            currentOwner: currentOwner,
            newOwner: newOwner,
            carId: carId,
            state: CHANGE_OWNER_STATE.PENDING,
            createTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
            modifyTime: new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString(),
            docType: 'transfer'
        }
        await ctx.stub.putState(request.id, Buffer.from(JSON.stringify(request)));
        return ctx.stub.getTxID();
    }

    
    public async queryChangeOwnerRequest(ctx: Context, newOwner: string){
        const queryString: any = {};
        queryString.selector = {
            newOnwer: newOwner,
            state: CHANGE_OWNER_STATE.PENDING,
            docType: DOCTYPE
        };
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));
        return JSON.parse(queryResult);
    }


    public async approveTransfer(ctx: Context, TransferOfferId: string): Promise<string> {
        const dealAsByte = await ctx.stub.getState(TransferOfferId);
        const deal: TransferOffer = JSON.parse(dealAsByte.toString());
        if(deal.newOwner !== this.getUserId(ctx)) return "PERMISSION DENIED";

        deal.state = CHANGE_OWNER_STATE.APPROVED;
        deal.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        
        const carAsBytes = await ctx.stub.getState(deal.carId);

        const car: Car = JSON.parse(carAsBytes.toString());

        car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyType = MODIFY_TYPE.APPROVED_TRANSFER;
        car.modifyUser = this.getUserId(ctx);

        await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
        await ctx.stub.putState(deal.id, Buffer.from(JSON.stringify(deal)));

        return ctx.stub.getTxID();
    }


    public async confirmTransfer(ctx: Context, transferRequestId: string): Promise<string> {
        const userAsByte = await ctx.stub.getState(this.getUserId(ctx));
        const user: User = JSON.parse(userAsByte.toString());
        if(user.role !== 'police') return "PERMISSION DENIED";

        const dealAsByte = await ctx.stub.getState(transferRequestId);
        const deal: TransferOffer = JSON.parse(dealAsByte.toString());

        deal.state = CHANGE_OWNER_STATE.CONFIRMED;
        deal.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();

        await ctx.stub.putState(deal.id, Buffer.from(JSON.stringify(deal)));
        
        const carAsBytes = await ctx.stub.getState(deal.carId);

        const car: Car = JSON.parse(carAsBytes.toString());

        car.owner = deal.newOwner;
        car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        car.modifyType = MODIFY_TYPE.CONFIRM_TRANSFER;
        car.modifyUser = this.getUserId(ctx);
        car.registrationState = REGISTRATION_STATE.REGISTERED

        await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
        
        return ctx.stub.getTxID();
    }

    public async rejectTransfer(ctx: Context, transferId: string) {
        const userAsByte = await ctx.stub.getState(this.getUserId(ctx));
        const user: User = JSON.parse(userAsByte.toString());
        const dealAsByte = await ctx.stub.getState(transferId);
        const deal: TransferOffer = JSON.parse(dealAsByte.toString());
        const carAsBytes = await ctx.stub.getState(deal.carId);
        const car: Car = JSON.parse(carAsBytes.toString());
        if ([deal.newOwner, deal.currentOwner].includes(user.id) || user.role ==='police'){
            deal.state = CHANGE_OWNER_STATE.REJECTED,
            deal.rejectUser = user.id;
            await ctx.stub.putState(deal.id, Buffer.from(JSON.stringify(deal)));
            car.modifyType = MODIFY_TYPE.CANCEL_TRANSFER;
            car.modifyUser = user.id;
            car.modifyTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
            car.registrationState = REGISTRATION_STATE.REGISTERED
            await ctx.stub.putState(car.id, Buffer.from(JSON.stringify(car)));
            return ctx.stub.getTxID();
        }
        else return "PERMISSION DENIED"
    }



    public async isOwnerOfCar(ctx: Context, carId: string, userId: string): Promise<string>{
        const queryString: any = {};
        queryString.selector = {
            id: carId,
            onwer: userId,
            docType: DOCTYPE,
        }
        const queryResult = await this.queryResult(ctx, JSON.stringify(queryString));
        if(queryResult.length === 0) {
            return BOOLEAN_STRING.false
        }
        return BOOLEAN_STRING.true;
    }

    public async getHistory(ctx: Context, id: string) {
        const history = await ctx.stub.getHistoryForKey(id);
        const result = await this.getAllResults(history, true);
        return result;
    }

    public async createUser(ctx: Context, userAsString: string) {
        console.log('START========CREATE-USER===========');
        const user: User = JSON.parse(userAsString);
        user.verified = user.verifyPolice ? true : false;
        user.createTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        user.updateTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        await ctx.stub.putState(user.id, Buffer.from(JSON.stringify(user)));
        console.log("END========CREATE-USER===========");
    }

    public async verifyUser(ctx: Context, userId: string) {
        const policeId = this.getUserId(ctx);
        const userAsBytes = await ctx.stub.getState(userId);
        const user: User = JSON.parse(userAsBytes.toString());
        user.verified = true;
        user.verifyPolice = policeId;
        user.updateTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        await ctx.stub.putState(user.id, Buffer.from(JSON.stringify(user)));
        return ctx.stub.getTxID();
    }

    public async changePassword(ctx: Context, userId: string, newPassword: string) {
        const userAsBytes = await ctx.stub.getState(userId);
        const user: User = JSON.parse(userAsBytes.toString());
        user.password = newPassword;
        await ctx.stub.putState(user.id, Buffer.from(JSON.stringify(user)));
        return ctx.stub.getTxID();
    }

    public async updateUser(ctx: Context, userAsString: string){
        console.log("======START=UPDATE=USER=======");
        const payload: User = JSON.parse(userAsString);
        const userAsBytes: Uint8Array= await ctx.stub.getState(payload.id);
        if (!userAsBytes || userAsBytes.length === 0){
            throw new Error('wrong UID');
        }
        const currentUser: User = JSON.parse(userAsBytes.toString());
        const modifyUser: User = {...currentUser, ...payload};
        modifyUser.updateTime = new Date(ctx.stub.getTxTimestamp().seconds * 1000).toString();
        await ctx.stub.putState(modifyUser.id, Buffer.from(JSON.stringify(modifyUser)));
        return ctx.stub.getTxID();
    }


    public async readUserByUID(ctx: Context, key: string): Promise<string> {
        const userAsBytes = await ctx.stub.getState(key);
        if (!userAsBytes || userAsBytes.length === 0) {
            throw new Error(`Cannot find any user has ${key} key`);
        }
        return userAsBytes.toString();
    }


    public async queryUserByPhoneNumber(ctx: Context, phoneNumber: string): Promise<string>{
        const queryString: any = {};
        queryString.selector = {};
        queryString.selector.phoneNumber = phoneNumber;
        const queryResult = await this.getQueryResultForQueryString(ctx, JSON.stringify(queryString));   
        return queryResult;
    }

    public async addCity(ctx: Context, payload: string) {
        try {
            const city: City = JSON.parse(payload);
            city.docType = "city";
            await ctx.stub.putState(city.id, Buffer.from(JSON.stringify(city)));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }


    public async updateCity(ctx: Context, payload: string) {
        try {
            const city: District = JSON.parse(payload);
            await ctx.stub.putState(city.id, Buffer.from(JSON.stringify(city)));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    public async addDistrict(ctx: Context, payload: string) {
        try {
            const district: District = JSON.parse(payload);
            district.docType = 'district';
            await ctx.stub.putState(district.id, Buffer.from(JSON.stringify(district)));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    public async updateDistrict(ctx: Context, payload: string) {
        try {
            const district: District = JSON.parse(payload);
            await ctx.stub.putState(district.id, Buffer.from(JSON.stringify(district)));
            return true;
        } catch (error) {
            console.log(error);
            return false;
        }
    }

    // public async switchSeri(ctx: Context, districtId: string) {
    //     try {
    //         const district: District = JSON.parse((await ctx.stub.getState(districtId)).toString());
    //         district.seriesIndex++;
    //         await ctx.stub.putState(district.id, Buffer.from(JSON.stringify(district)));
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }

    // public async switchNumber(ctx: Context, districtId: string) {
    //     try {
    //         const district: District = JSON.parse((await ctx.stub.getState(districtId)).toString());
    //         district.numberIndex++;
    //         await ctx.stub.putState(district.id, Buffer.from(JSON.stringify(district)));
    //     } catch (error) {
    //         console.log(error)
    //     }
    // }
}