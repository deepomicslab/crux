export function statistics(data: number[]): Statistics {
    return new Statistics(data);
}

export class Statistics {
    private _data: number[];
    private _min: number;
    private _max: number;
    private _sum: number;
    private _mean: number;
    private _oneQuarter: number;
    private _threeQuarters: number;
    private _length: number;

    constructor(data: number[]) {
        this._data = data.sort((x, y) => x - y);
        this._length = this._data.length;
        this._oneQuarter = this._data[Math.floor(this._length / 4)];
        this._mean = this._length % 2 === 0 ? (this._data[this._length / 2] + this._data[this._length / 2 + 1]) / 2 : this._data[Math.floor(this._length / 2)];
        this._threeQuarters = this._data[Math.floor(this._length / 4 * 3)];
        if (this._data.length > 0) {
            let sum = 0;
            let min = this._data[0];
            let max = this._data[0];
            for (const d of this._data) {
                sum += d;
                min = d < min ? d : min;
                max = d > max ? d : max;
            }
            this._min = min;
            this._max = max;
            this._sum = sum;
        } else {
            throw new Error(`Data is empty`);
        }
    }

    public getData(): number[] { return this._data; }

    public getLength(): number { return this._length; }

    public getSum(): number { return this._sum; }

    public getMin(): number { return this._min; }

    public getMax(): number { return this._max; }

    public getMean(): number { return this._mean; }

    public getOneQuarter(): number { return this._oneQuarter; }

    public getThreeQuarters(): number { return this._threeQuarters; }
}
