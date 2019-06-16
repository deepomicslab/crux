import { GeometryOptValue } from "../../defs/geometry";
import { svgPropFillAndStroke, svgPropPassthrough } from "../../rendering/svg-helper";
import { BaseElementOption } from "./base-elm-options";
import { PrimitiveElement } from "./primitive";

export interface PolylineOption extends BaseElementOption {
    points: [number, number][];
}

export class Polyline extends PrimitiveElement<PolylineOption> {

    public svgAttrs() {
        let pointsStr = ``;
        for (const p of this.prop.points) {
            const [x, y] = this.translatePoint(p[0], p[1]);
            pointsStr += `${x},${y} `;
        }
        return {
            ...svgPropFillAndStroke(this),
            ...svgPropPassthrough({
                "shape-rendering": "shapeRendering",
            })(this),
            points: pointsStr,
        };
    }

    public svgTagName() {return "polyline"; }
    public svgTextContent() { return null; }

    public defaultProp() {
        return {
            stroke: "#000",
            fill: "none",
        };
    }

    public positionDetached = true;
}
