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
    registrationCity?: string;
    registrationDistrict?: string;
    processedPolice?: string;
}
export class City {
    public id?: string;
    public name?: string;
    public number?: string|string[];
    public series?: string[];
    public docType?: string;
}

export class District{
    public id?: string;
    public districtName?: string;
    public city?: string;
    public numberIndex?: number;
    public seriesIndex?: number;
    public docType?: string;
    public headquartersAddress?: string;
}