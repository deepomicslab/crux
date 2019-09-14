export function stackedLayout<T>(data: T[]): StackedLayout<T> {
    return new StackedLayout(data);
}

export class StackedLayout<T> {
    private _value!: (data: T) => number;
    private _extentOf!: (data: T, layer?: number) => [number, number];

    private _data: T[];

    constructor(data: T[]) {
        this._data = data;
    }

    public value(fn: (data: T) => number): this {
        this._value = fn;
        return this;
    }

    public extent(fn: (data: T, layer?: number) => [number, number]): this {
        this._extentOf = fn;
        return this;
    }

    public run(): T[][] {
        if (!this._value || !this._extentOf) {
            throw new Error(`StackedLayout: value and extent must be supplied.`);
        }
        // sort
        this._data.sort((a, b) => this._value(a) - this._value(b));
        // stack
        let currentLayer = 0;
        const layerMaxValue: number[] = [-Number.MAX_VALUE];
        // process
        const layers: T[][] = [[]];

        this._data.forEach((d) => {
            const layerExtent = this._extentOf.length > 1;
            let extent: [number, number];
            if (!layerExtent) {
                extent = this._extentOf(d);
            }
            let placedLayer = -1;
            for (let layer = 0; layer <= currentLayer; layer += 1) {
                if (layerExtent) {
                    extent = this._extentOf(d, layer);
                }
                if (layerMaxValue[layer] < extent![0]) {
                    // place
                    layerMaxValue[layer] = extent![1];
                    placedLayer = layer;
                    break;
                }
            }
            if (placedLayer < 0) {
                currentLayer += 1;
                layerMaxValue[currentLayer] = extent![1];
                placedLayer = currentLayer;
                layers[placedLayer] = [];
            }
            layers[placedLayer].push(d);
        });

        return layers;
    }
}
