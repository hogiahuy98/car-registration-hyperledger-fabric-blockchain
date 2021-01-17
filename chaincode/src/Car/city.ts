export class City {
    public id: string;
    public name: string;
    public number?: string|string[];
    public series?: string[];
    public docType?: string;
}

export class District{
    public id: string;
    public districtName: string;
    public city: string;
    public currentNumber?: number;
    public currentSeri?: number;
    public docType?: string;
    public headquartersAddress?: string;
}