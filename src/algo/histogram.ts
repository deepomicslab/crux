export function histogram<T>(data: T[], scale: string = "count", numberOfBins: number = 0, threshold: number[] = [], isAccumulated: boolean = false):
Histogram<T> {
    return new Histogram(data, scale, numberOfBins, threshold, isAccumulated);
}

export class Histogram<T> {
    private _data: T[];
    private _bins: {x1: number, x2: number, y: number}[];
    private _max: number;
    private _numberOfBins: number;
    private _gap: number;

    constructor(data: T[], scale: string = "count", numberOfBins: number = 0, threshold: number[] = [], isAccumulated: boolean = false) {
        if (scale !== "count" && scale !== "area") {
            throw new Error('scale can only be "count" or "area".');
        }
        if (data.length !== 0) {
            const withCount = Array.isArray(data[0]);
            this._data = withCount ? data.sort((a, b) => a[0] - b[0]) : data.sort((a, b) => Number(a) - Number(b));
            const points = withCount ? this._data.map(d => d[0]) : this._data;
            const counts = withCount ? this._data.map(d => d[1]) : this._data.map(_ => 1);
            const countSum = counts.reduce((a, b) => a + b, 0);
            this._numberOfBins = threshold.length !== 0 ? threshold.length - 1 : (numberOfBins !== 0 ? numberOfBins : Math.ceil(Math.sqrt(this._data.length)));
            this._gap = (points[points.length - 1] - points[0]) / this._numberOfBins;

            let dataIndex = 0;
            let accumulatedCount = 0;
            this._bins = [...Array(this._numberOfBins + 1).keys()].map(i => {
                let count = 0;
                const x1 = threshold.length !== 0 ? threshold[i] : points[0] + this._gap * (i - 0.5);
                const x2 = threshold.length !== 0 ? threshold[i + 1] : points[0] + this._gap * (i + 0.5);
                while (dataIndex < points.length && points[dataIndex] >= x1 && points[dataIndex] < x2) {
                    count += counts[dataIndex];
                    dataIndex++;
                }
                accumulatedCount += count;
                count = isAccumulated ? accumulatedCount : count;
                const y = scale === "count" ? count : count / (x2 - x1) / countSum;
                return {x1, x2, y};
            });
            this._max = Math.max(...this._bins.map(d => d.y));
        } else {
            throw new Error(`Data is empty.`);
        }
    }

    public getData(): T[] { return this._data; }

    public getBins(): {x1: number, x2: number, y: number}[] { return this._bins; }

    public getMax(): number { return this._max; }

    public getNumberOfBins(): number { return this._numberOfBins; }

    public getGap(): number { return this._gap; }
}
