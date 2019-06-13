import { ColorScheme } from "./color-scheme";

export class ColorSchemeCategory<T extends number|string> implements ColorScheme {
    public colors: Record<T, string>;

    constructor(public categories: T[]) {
        const n = this.categories.length;
        const gap1Count = n / 2;
        const gap2Count = gap1Count + n % 2;
        const gap1Size = 360.0 / (gap1Count + gap2Count * 1.25);
        const gap2Sise = gap1Size * 1.618;
        let a = 0;
        let flag = false;
        this.colors = {} as any;
        this.categories.forEach((c, i) => {
            let h = 200 + a;
            if (h > 360) h -= 360;
            this.colors[c] = `hsl(${h},${flag ? 95 : 85}%,${flag ? 65 : 55}%)`;
            a += flag ? gap1Size : gap2Sise;
            flag = !flag;
        });
    }

    public getColor(category: number|string) {
        return this.colors[category] || "#000";
    }

    public legendData() {
        return this.categories.map(c => ({ label: c.toString(), fill: this.getColor(c)}));
    }

    public static create(c: number | number[]): ColorSchemeCategory<number>;
    public static create(c: string[]): ColorSchemeCategory<string>;
    public static create(c: number | (number|string)[]): ColorSchemeCategory<string> | ColorSchemeCategory<number> {
        if (typeof c === "number") {
            return new ColorSchemeCategory<number>(Array.from(Array(c)).map((_, i) => i));
        } else {
            return new ColorSchemeCategory(c) as any;
        }
    }
}
