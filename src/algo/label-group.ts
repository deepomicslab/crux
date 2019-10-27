interface MutLayoutGroup {
    min: number;  // min mut point index
    max: number;  // max mut point index
}

interface DataMut {
    _displayX?: number;
    _adjustedX?: number;
    _offsetX?: number;
    _displayed?: boolean;
}

export function labelGroup<T>(data: T[]): LabelGroup<T> {
    return new LabelGroup(data);
}

export class LabelGroup<T> {
    public _maxWidth: number = 600;
    public _minWidth: number = 0;
    public _minGap: number = 14;

    public data: Array<T & DataMut>;
    public _displayX!: (d: T) => number;

    /** Distance between data[i] and data[i - 1] */
    private _distance!: number[];
    private _groups!: MutLayoutGroup[];
    /** The group the i-th mut point belongs to */
    private _groupOf!: MutLayoutGroup[];

    constructor(data: T[]) {
        this.data = data;
    }

    public minGap(gap: number): this {
        this._minGap = gap;
        return this;
    }

    public maxSize(size: [number, number]): this {
        this._minWidth = size[0];
        this._maxWidth = size[1];
        return this;
    }

    public displayX(fn: (d: T) => number): this {
        this._displayX = fn;
        return this;
    }

    private prepare() {
        // initialize distance obj, reset all related fields in data
        this._distance = [0];
        let di: T & DataMut;
        let pi: T & DataMut;  // data[i], previous i
        for (let i = 0; i < this.data.length; i++) {
            di = this.data[i];
            pi = this.data[i - 1];
            di._adjustedX = di._displayX = this._displayX(di);
            di._offsetX = 0;
            di._displayed = di._displayX >= this._minWidth && di._displayX <= this._maxWidth;
            if (i === 0) { continue; }
            this._distance[i] = di._displayX - pi._displayX!;
        }
        // initialize groups
        this._groups = [];
        this._groupOf = Array.from(Array(this.data.length));
    }

    private adjust(group: MutLayoutGroup) {
        const minPos = this.data[group.min]._displayX!;
        const maxPos = this.data[group.max]._displayX!;
        const mutCount = group.max - group.min + 1;
        const spanNeeded = (mutCount - 1) * this._minGap;
        const spanMidPoint = (minPos + maxPos) / 2;
        const leftEdge = spanMidPoint - spanNeeded / 2;
        const rightEdge = spanMidPoint + spanNeeded / 2;

        // check if need to add left element to group
        if (group.min > 0) {  // if not the first mut point
            const prev = group.min - 1;
            const leftElX = this.data[prev]._displayX!;
            if (leftElX >= this._minWidth && leftEdge - leftElX < this._minGap) {
                // add left element to group
                if (this._groupOf[prev]) {  // if left already belongs to a group, need merge
                    const leftGroup = this._groupOf[prev];
                    // remove left group
                    const leftGroupIndex = this._groups.indexOf(leftGroup);
                    console.assert(leftGroupIndex >= 0);
                    this._groups.splice(leftGroupIndex, 1);
                    // merge
                    group.min = leftGroup.min;
                    for (let i = leftGroup.min; i <= leftGroup.max; i++) {
                        this._groupOf[i] = group;
                    }
                } else {  // don't need merge
                    group.min = prev;
                    this._groupOf[prev] = group;
                }
                this.adjust(group);
            }
        }

        // check if need to add right element to group
        if (group.max < this.data.length - 1) {
            const next = group.max + 1;
            const rightElX = this.data[next]._displayX!;
            if (rightElX <= this._maxWidth && rightElX - rightEdge < this._minGap) {
                // add right
                if (this._groupOf[next]) {  // next has a group, need merge
                    const rightGroup = this._groupOf[next];
                    // remove right group
                    const rightGroupIndex = this._groups.indexOf(rightGroup);
                    console.assert(rightGroupIndex >= 0);
                    this._groups.splice(rightGroupIndex, 1);
                    // merge
                    group.max = rightGroup.max;
                    for (let i = rightGroup.min; i <= rightGroup.max; i++) {
                        this._groupOf[i] = group;
                    }
                } else {
                    group.max = next;
                    this._groupOf[next] = group;
                }
                this.adjust(group);
            }
        }
    }

    public run(): Array<T & DataMut> {
        this.prepare();
        // do grouping
        for (let i = 1; i < this._distance.length; i++) {
            const curr = this._distance[i];
            if (curr < this._minGap && !this._groupOf[i] && this.data[i]._displayed) {
                // group two close elements
                const group = {min: i - 1, max: i};
                this._groups.push(group);
                this._groupOf[i] = this._groupOf[i - 1] = group;
                this.adjust(group);
            }
        }
        // calculate
        for (const i of this._groups) {
            const minPos = this.data[i.min]._displayX!;
            const maxPos = this.data[i.max]._displayX!;
            const count = i.max - i.min + 1;
            const spanNeeded = (count - 1) * this._minGap;
            const spanMidPoint = (minPos + maxPos) / 2;
            const leftEdge = spanMidPoint - spanNeeded / 2;
            let j = -1;
            for (let k = i.min; k <= i.max; k++) {
                j++;
                this.data[k]._adjustedX = leftEdge + this._minGap * j;
                this.data[k]._offsetX = this.data[k]._adjustedX! - this.data[k]._displayX!;
            }
        }
        return this.data;
    }

}
