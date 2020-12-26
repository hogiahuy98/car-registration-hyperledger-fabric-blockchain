export interface Car {
    id: string;
    registrationNumber?: string;
    brand: string;
    model: string;
    color: string;
    chassisNumber: string;
    engineNumber: string;
    capality: string;
    year: string;
    owner: string;
    createTime?: string;
    modifyTime?: string;
    registrationState?: string;
    processedPolice?: string;
}

export class City {
    public id?: string;
    public name?: string;
    public headquartersAddress?: string;
    public number?: string|string[];
    public series?: Array<string>;
    public currentSeries?: number;
    public docType?: string;
}

export class District extends City {
    public under?: string;
}