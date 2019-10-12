import { Component, ComponentOption } from "../../../element";
import { Circos, CircosSection } from "../circos";
import { CircosLayer } from "./layer";

export interface CircosContentOption extends ComponentOption {
}

export abstract class CircosContent<Option extends CircosContentOption> extends Component<Option> {
    public get layer(): CircosLayer {
        return this.parent.parent as CircosLayer;
    }

    public get section(): CircosSection {
        return this.layer.prop.section;
    }

    public get circos(): Circos {
        return this.layer.prop.section.circos;
    }

    public boundaryForScale(hotizontal: boolean): [number, number] {
        if (hotizontal) {
            return super.boundaryForScale(hotizontal);
        } else {
            return [this.layer.innerR, this.layer.outerR];
        }
    }
}
