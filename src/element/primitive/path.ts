import { svgPropFillAndStroke } from "../../rendering/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

export interface PathOption extends BaseElementOption {
    d: string;
}

export class Path extends PrimitiveElement<PathOption> {
    public static propNameForInitializer(): string { return "d"; }

    public svgAttrs() {
        return {
            ...svgPropFillAndStroke(this),
            d: this.prop.d,
        };
    }

    public svgTagName() { return "path"; }
    public svgTextContent() { return null; }
}
