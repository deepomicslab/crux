import { compile } from "../template/compiler";
import { Component } from "./component";
import { registerComponent } from "./global";

export function createComponent(t: string, name?: string): typeof Component {
    let c: any;
    const n = name || "Unknown";
    c = { [n]: class extends Component {} }[n];
    c.prototype.render = compile(t).renderer;
    if (name) {
        registerComponent({ [n]: c });
    }
    return c as any;
}
