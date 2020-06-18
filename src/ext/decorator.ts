import { compile } from "../template/compiler";

export function useTemplate(t: string) {
    // tslint:disable-next-line: only-arrow-functions
    return function (target: any) {
        const renderer = compile(t).renderer;
        target.prototype.render = renderer;
    };
}
