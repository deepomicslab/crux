import { useTemplate } from "../../ext/decorator";
import { BaseChart, BaseChartOption } from "./base-chart";

const a1: number[] = [];
const a2: number[] = [];
const a3: number[] = [];

export interface AreaOption extends BaseChartOption {
    data: any[];
    xOffset: number;
    fill: string;
    stroke: string;
    pathOptions: any;
}

@useTemplate(`
Component {
    Path {
        d = $v.isSVG ? getPath() : getCanvasPath.bind(this)
        fill = prop.fill || "#aaa"
        stroke = prop.stroke
        @props prop.pathOptions
    }
}
`)
export class Area extends BaseChart<AreaOption> {
    private idx = 0;
    private buffer!: Uint8Array;
    private bufferLength = 0;
    private _hasMinValue = false;
    private _decoder?: TextDecoder;

    public init() {
        if (window.TextDecoder) {
            this._decoder = new TextDecoder("utf-8");
        }
    }

    private updateData() {
        this._hasMinValue = false;
        const value = this.data.values as any[];
        const xOffset = this.prop.xOffset || 0;

        value.forEach((d, i) => {
            let minValue = 0;
            if ("minValue" in d && d.minValue !== 0) {
                this._hasMinValue = true;
                minValue = this.getY(d.minValue);
            }
            a1[i] = this.getX(d.pos + xOffset);
            a2[i] = this.getY(d.value);
            a3[i] = minValue;
        });
    }

    // @ts-ignore
    private getPath(): string {
        this.updateData();
        const len = (this.data.values as any[]).length;
        const yMin = this.getY(0);
        // generate path
        this.idx = 0;
        if (!this.buffer || this.buffer.length < len * 20) {
            this.buffer = new Uint8Array(len * 20);
            this.bufferLength = len * 20;
        }
        let buffer = this.buffer;
        // let path = `M${a1[0]},${yMin} `;
        buffer[this.idx++] = 77;
        this.toCharCode(buffer, a1[0]);
        buffer[this.idx++] = 44;
        this.toCharCode(buffer, yMin);
        buffer[this.idx++] = 32;

        for (let i = 0; i < len; i++) {
            // path += `L${a1[i]},${a2[i]} `;
            buffer[this.idx++] = 76;
            this.toCharCode(buffer, a1[i]);
            buffer[this.idx++] = 44;
            this.toCharCode(buffer, a2[i]);
            buffer[this.idx++] = 32;
            if (this.idx > this.bufferLength - 30) {
                this.growBuffer(this.bufferLength * 2);
                buffer = this.buffer;
            }
        }

        if (this._hasMinValue) {
            for (let i = len - 1; i >= 0; i--) {
                // path += `L${a1[i]},${a3[i]} `;
                buffer[this.idx++] = 76;
                this.toCharCode(buffer, a1[i]);
                buffer[this.idx++] = 44;
                this.toCharCode(buffer, a3[i]);
                buffer[this.idx++] = 32;
                if (this.idx > this.bufferLength - 30) {
                    this.growBuffer(this.bufferLength * 2);
                    buffer = this.buffer;
                }
            }
        } else {
            buffer[this.idx++] = 76;
            this.toCharCode(buffer, a1[len - 1]);
            buffer[this.idx++] = 44;
            this.toCharCode(buffer, yMin);
            buffer[this.idx++] = 32;
        }
        // path += `z`;
        buffer[this.idx++] = 122;
        if (this._decoder) {
            return this._decoder.decode(buffer.subarray(0, this.idx));
        } else {
            return uint8ToString(buffer);
        }
    }

    // @ts-ignore
    private getCanvasPath(path: Path2D) {
        this.updateData();
        const len = (this.data.values as any[]).length;
        const yMin = this.getY(0);
        // generate path
        path.moveTo(a1[0], yMin);

        for (let i = 0; i < len; i++) {
            path.lineTo(a1[i], a2[i]);
        }
        if (this._hasMinValue) {
            for (let i = len - 1; i >= 0; i--) {
                path.lineTo(a1[i], a3[i]);
            }
        }
        path.closePath();
    }

    private growBuffer(len: number) {
        console.assert(this.buffer);
        if (!this.buffer) return;

        const newBuffer = new Uint8Array(len);
        newBuffer.set(this.buffer);
        this.buffer = newBuffer;
        this.bufferLength = len;
    }

    private toCharCode(buffer: Uint8Array, num: number) {
        if (num === 0) {
            buffer[this.idx++] = 48; // 0
            return;
        } else if (num < 0) {
            buffer[this.idx++] = 45; // -
            num = -num;
        }
        const n = Math.round(num * 1000);
        this.toCharCodeStep(buffer, 0, n);
    }

    private toCharCodeStep(buffer: Uint8Array, i: number, n: number) {
        if (n < 1 && i > 3) return;
        this.toCharCodeStep(buffer, i + 1, (n / 10) >> 0);
        buffer[this.idx++] = (n % 10) + 48;
        if (i === 3) buffer[this.idx++] = 46; // .
    }
}

function uint8ToString(u8a: Uint8Array) {
    const CHUNK_SZ = 0x8000;
    const c = [];
    for (let i = 0; i < u8a.length; i += CHUNK_SZ) {
        if (u8a[i] === 0) break;
        c.push(String.fromCharCode.apply(null, u8a.subarray(i, i + CHUNK_SZ) as any));
    }
    return c.join("");
}
