export class City {
    public id: string;
    public name: string;
    public headquartersAddress?: string;
    public number?: string|string[];
    public series?: string[];
    public currentSeries?: number;
    public docType?: string;
    public multiDistricts?: boolean;
}

export class District extends City {
    public under: string;
}