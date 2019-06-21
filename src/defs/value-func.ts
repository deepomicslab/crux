type _ValueFunc<Datum, Result> =
    (this: SVGElement,
     args: {
            datum: Datum,
            index: number,
            groups: SVGElement[] | ArrayLike<SVGElement>,
        }) => Result;

export type ValueFunc<Datum, Result> = _ValueFunc<Datum, Result> | Result;
