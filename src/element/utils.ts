import { ElementDef } from "../rendering/render-tree";
import { Component } from "./component";

interface CreateComponentOption {
    name?: string;
}

export function createComponent(renderer: (() => ElementDef), opt: CreateComponentOption = {}): typeof Component {
    return class extends Component {
        public render = renderer;
    } as any;
}
