import { getCarContract } from './CommonFuntion';
import { Car, City, District } from './CarInterface';
import { nanoid } from 'nanoid';
export { Car, City, District } from './CarInterface'


export async function registryCar(car: Car, phoneNumber: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const params: Array<any> = [
            car.id,
            car.engineNumber,
            car.chassisNumber,
            car.brand,
            car.model,
            car.color,
            car.year,
            car.capality,
            car.owner,
            car.registrationCity,
            car.registrationDistrict
        ]
        const result = await contract.submitTransaction('createRegistration', ...params);
        return { success: true, result: JSON.parse(result.toString()) };
    } catch (error) {
        return { success: false, result: { error: error } };
    }
}


export async function updateRegistration(userId: string, carId: string, payload: any) {
    try {
        const contract = await getCarContract(userId);
        const result = await contract.submitTransaction('updateRegistration', carId, JSON.stringify(payload));
        return JSON.parse(result.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}


export async function getAllCars(phoneNumber: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const carsAsBuffer = await contract.evaluateTransaction('queryAllCars');
        const cars = JSON.parse(carsAsBuffer.toString());
        return { success: true, result: { cars } };
    } catch (error) {
        return { success: false, result: { error: error } }
    }
}


export async function getCarById(phoneNumber: string, carId: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const carsAsBuffer = await contract.evaluateTransaction('queryCarById', carId);
        const car = JSON.parse(carsAsBuffer.toString());
        return car;
    } catch (error) {
        console.log(error);
        return null
    }
}


export async function getProcesscingCars(phoneNumber: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const processingCarsAsBuffer = await contract.evaluateTransaction('queryAllProcessingCar');
        const processingCars = JSON.parse(processingCarsAsBuffer.toString());
        if (processingCars.length > 0) {
            return { success: true, result: { processingCars } };
        }
        else {
            throw new Error("Không có xe đang xử lí");
        }
    } catch (error) {
        return { success: false, result: { msg: error } };
    }
}


export async function acceptCarRegistration(carId: string, registrationNumber: string, phoneNumber: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const TxID = await contract.submitTransaction('acceptRegistration', carId, registrationNumber);
        if (TxID.toString().length !== 0) {
            return { success: true, result: { TxID: TxID.toString() }};
        }
        else {
            throw new Error("Không thể hoàn thành đăng ký");
        }
    } catch (error) {
        return { success: false, result: { msg: error }};
    }
}

export async function rejectCarRegistration(carId: string, phoneNumber: string) {
    try {
        const contract = await getCarContract(phoneNumber);
        const TxID = await contract.submitTransaction('rejectRegistration', carId);
        if (TxID.toString().length !== 0) {
            return { success: true, result: { TxID: TxID.toString() }};
        }
        else {
            throw new Error("Không thể hoàn thành đăng ký");
        }
    } catch (error) {
        return { success: false, result: { msg: error }};
    }
}

export async function isOwnerOfCar(carId: string, userId: string): Promise<any> {
    try {
        const contract = await getCarContract(userId);
        const queryString: any = {};
        queryString.selector = {
            docType: 'car',
            id: carId,
            owner: userId
        }
        const resultByte = await contract.evaluateTransaction('queryResult', JSON.stringify(queryString));
        const result = JSON.parse(resultByte.toString());
        if(result.length > 0){
            return { success: true, result: { isOwner: true } }
        }
        return { success: true, result: { isOwner: false } }
    } catch (error) {
        return { success: false, result: { msg: error }}
    }
}

export async function requestChangeOwner(carId: string,  newOwner: string, currentOwner: string) {
    try {
        const contract = await getCarContract(currentOwner);
        const dealId = 'D' + nanoid().toUpperCase();
        const TxIDByte = await contract.submitTransaction('createTransferDeal', dealId, carId, currentOwner, newOwner);
        const TxID = TxIDByte.toString();
        if( TxID !== "" || TxID.length !== 0) {
            return { success: true, result: { TxID: TxID } }
        }
        else {
            throw new Error("Có lỗi khi gọi transaction");
        }
    } catch (error) {
        console.log(error);
        return { success: false, result: { msg: error } }
    }
}

export async function approveTransferDeal(userId: string, dealId: string){
    try {
        const contract = await getCarContract(userId);
        const TxID = await contract.submitTransaction('approveTransfer', dealId);
        if(TxID.toString() === "PERMISSION DENIED") throw new Error(TxID.toString());
        return TxID.toString();
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

export async function confirmTransferDeal(userId: string, dealId: string){
    try {
        const contract = await getCarContract(userId);
        const TxID = await contract.submitTransaction('confirmTransfer', dealId);
        if(TxID.toString() === "PERMISSION DENIED") throw new Error(TxID.toString());
        return TxID.toString();
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

export async function rejectTransferDeal(userId: string, dealId: string){
    try {
        const contract = await getCarContract(userId);
        const TxID = await contract.submitTransaction('rejectTransfer', dealId);
        if(TxID.toString() === "PERMISSION DENIED") throw new Error(TxID.toString());
        return TxID.toString();
    } catch (error) {
        console.log(error);
        return undefined;
    }
}

export async function queryCars(userId: string, queryString: string): Promise<any> {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.evaluateTransaction('queryResult', queryString);
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        throw error;
    }
}

export async function getHistoryOfCar(phoneNumber: string, carId: string): Promise<any> {
    try {
        const contract = await getCarContract(phoneNumber);
        const resultsBuffer = await contract.evaluateTransaction('getHistory', carId);
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        throw error;
    }
}

export async function addCity(userId: string, city: City) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('addCity', JSON.stringify(city));
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function updateCity(userId: string, city: City) {
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('updateCity', JSON.stringify(city));
        return JSON.parse(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
        throw error;
    }
}

export async function addDistrict(userId: string, district: District){
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('addDistrict', JSON.stringify(district));
        console.log(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
    }
}

export async function updateDistrict(userId: string, district: District){
    try {
        const contract = await getCarContract(userId);
        const resultsBuffer = await contract.submitTransaction('updateDistrict', JSON.stringify(district));
        console.log(resultsBuffer.toString());
    } catch (error) {
        console.log(error);
    }
}
export async function getCity(cityId: string) {
    const queryString = {
        selector: {
            id: cityId,
            docType: "city"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    console.log(result);
    return result[0].Record;
}

export async function getDistrict(districtId: string) {
    const queryString = {
        selector: {
            id: districtId,
            docType: "district"
        }
    }
    const result = await queryCars('admin', JSON.stringify(queryString));
    return result[0].Record;
}