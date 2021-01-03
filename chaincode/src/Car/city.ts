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
    public numberIndex?: number;
    public seriesIndex?: number;
    public docType?: string;
    public headquartersAddress?: string;
}