import { Color } from "../color";
import { ColorScheme } from "./scheme";

export class ColorSchemeCategory<T extends number|string> implements ColorScheme {
    public colors: Record<T, string>;
    public categories: string[];

    constructor(data: any, initialColor?: [number, number, number]) {
        if (initialColor && Array.isArray(data)) {
            this.categories = data;
            const n = this.categories.length;
            const gap1Count = n / 2;
            const gap2Count = gap1Count + n % 2;
            const gap1Size = 360.0 / (gap1Count + gap2Count * 1.25);
            const gap2Sise = gap1Size * 1.618;
            let a = 0;
            let flag = false;
            const [ih, is, il] = initialColor;
            this.colors = {} as any;
            this.categories.forEach((c, i) => {
                let h = ih + a;
                if (h > 360) h -= 360;
                this.colors[c] = `hsl(${h},${is + (flag ? 5 : 5)}%,${il + (flag ? 5 : -5)}%)`;
                a += flag ? gap1Size : gap2Sise;
                flag = !flag;
            });
        } else {
            this.colors = data;
            this.categories = Object.keys(data);
        }
    }

    public get(category: number|string) {
        return this.colors[category] || "#000";
    }

    public legendData() {
        return this.categories.map(c => ({ label: c.toString(), fill: this.get(c)}));
    }

    public static create<T extends (number | string)>(
        k: number | T[],
        colors?: string[],
        initialColor?: string,
    ): ColorSchemeCategory<T> {
        let colorDict: T[] | Record<T, string>;
        const cat = typeof k === "number" ?
            Array.from(Array(k)).map((_, i) => i) as T[] : k;

        if (colors) {
            const len = colors.length;
            colorDict = {} as Record<T, string>;
            for (let i = 0; i < cat.length; i++) {
                colorDict[cat[i]] = colors[i % len];
            }
            return new ColorSchemeCategory(colorDict);
        } else {
            colorDict = cat;
            const ic = initialColor ? Color.literal(initialColor).hsl : [200, 80, 50] as [number, number, number];
            return new ColorSchemeCategory(colorDict, ic);
        }
    }
}
