import { compile } from "../template/compiler";

export function useTemplate(t: string) {
    // tslint:disable-next-line: only-arrow-functions
    return function(target: any) {
        const renderer = compile(t)[0];
        target.prototype.render = renderer;
    };
}
