import * as cv from "color-convert";

export class Color {
    private _rgb: [number, number, number] = [0, 0, 0];
    private _hsl: [number, number, number] = [0, 0, 0];
    private _alpha = 1;
    public string: string = "#000";

    public get rgb() { return this._rgb; }
    public set rgb(value: [number, number, number]) {
        this._rgb = value;
        this._hsl = cv.rgb.hsl(value);
        this._updateString();
    }

    public get hsl() { return this._hsl; }
    public set hsl(value: [number, number, number]) {
        this._hsl = value;
        this._rgb = cv.hsl.rgb(value);
        this._updateString();
    }

    private _updateString() {
        if (this._alpha === 1) {
            this.string = "#" + cv.rgb.hex(this._rgb);
        } else {
            const [r, g, b] = this._rgb;
            this.string = `rgba(${r}, ${g}, ${b}, ${this._alpha})`;
        }
    }

    public lighten(amount: number) {
        const [h, s, l] = this._hsl;
        return Color.hsl(h, s, bound(l + amount));
    }

    public darken(amount: number) {
        const [h, s, l] = this._hsl;
        return Color.hsl(h, s, bound(l - amount));
    }

    public saturate(amount: number) {
        const [h, s, l] = this._hsl;
        return Color.hsl(h, bound(s + amount), l);
    }

    public desaturate(amount: number) {
        const [h, s, l] = this._hsl;
        return Color.hsl(h, bound(s - amount), l);
    }

    public shiftHue(amount: number) {
        const [h, s, l] = this._hsl;
        const rawH = h + amount;
        const newH = rawH < 0 ? 360 + rawH : rawH > 360 ? rawH - 360 : rawH;
        return Color.hsl(newH, s, l);
    }

    public clone() {
        return Color.hsl.apply(null, this._hsl);
    }

    public static rgb(r: number, g: number, b: number) {
        const c = new Color();
        c.rgb = [r, g, b];
        return c;
    }

    public static hsl(h: number, s: number, l: number) {
        const c = new Color();
        c.hsl = [h, s, l];
        return c;
    }

    public static literal(t: string) {
        const c = new Color();
        if (t[0] === "#") {
            c.rgb = cv.hex.rgb(t.substr(1));
        } else if (t.startsWith("rgba")) {
            const [r, g, b, a] = t.slice(5, -1).split(",").map(n => parseFloat(n));
            c._alpha = a;
            c.rgb = [r, g, b];
        } else {
            c.rgb = cv.keyword.rgb(t as any);
        }
        return c;
    }
}

function bound(num: number, min = 0, max = 100) {
    return num > max ? max : num < min ? min : num;
}
