import { toRad } from "./math";

export class Matrix {
    constructor(
        public a = 1,
        public c = 0,
        public e = 0,
        public b = 0,
        public d = 1,
        public f = 0,
    ) { }

    public static translate(x: number, y: number) {
        return new Matrix(1, 0, x, 0, 1, y);
    }

    public static rotate(d: number) {
        const cos = Math.cos(toRad(d));
        const sin = Math.sin(toRad(d));
        return new Matrix(cos, -sin, 0, sin, cos, 0);
    }

    public transform(m: Matrix) {
        return multiply(this, m);
    }

    public inverse(): Matrix {
        const C = 1.0 / (this.a * this.d - this.b * this.c);
        return new Matrix(
            this.d * C,
            -this.c * C,
            (this.c * this.f - this.d * this.e) * C,
            -this.b * C,
            this.a * C,
            (this.b * this.e - this.a * this.f) * C,
        );
    }
}

const multiply = (m1: Matrix, m2: Matrix) => {
    return new Matrix(
        m1.a * m2.a + m1.c * m2.b,
        m1.a * m2.c + m1.c * m2.d,
        m1.a * m2.e + m1.c * m2.f + m1.e,
        m1.b * m2.a + m1.d * m2.b,
        m1.b * m2.c + m1.d * m2.d,
        m1.b * m2.e + m1.d * m2.f + m1.f,
    );
};
