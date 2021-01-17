export class Car{
    public id: string;
    public registrationNumber?: string;
    public brand: string;
    public model: string;
    public color: string;
    public engineNumber: string;
    public chassisNumber: string;
    public capality: string;
    public owner: string;
    public year: string;
    public registrationCity?: string;
    public registrationDistrict?: string;
    public type?: string;
    public createTime?: string;
    public modifyTime?: string;
    public modifyType?: Number;
    public modifyUser?: string;
    public registrationTime?: string;
    public registrationState: string;
    public processedPolice?: string;
    public docType: string;
}

export class TransferOffer{
    public id: string;
    public carId: string;
    public currentOwner: string;
    public newOwner: string;
    public state: Number;
    public createTime?: string;
    public modifyTime?: string;
    public acceptTime?: string;
    public rejectTime?: string;
    public rejectUser?: string;
    public docType: string;
}
