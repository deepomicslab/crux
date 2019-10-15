import { template } from "../../../template/tag";
import { CircosContent, CircosContentOption } from "./content";

export interface CircosContentCytobandOption extends CircosContentOption {
    data: any[];
}

export class CircosContentCytoband extends CircosContent<CircosContentCytobandOption> {
    public render = template`
    Component {
        @for band in prop.data {
            Arc.rad {
                key = band.cytoband
                x1 = @scaledX(band.startPos)
                x2 = @scaledX(band.endPos)
                r1 = layer.innerR
                r2 = layer.outerR
                fill = bandColor[band.color]
            }
        }
    }
    `;

    // @ts-ignore
    private bandColor = {
        stalk: "#f0f0f0",
        gvar: "#f0f0f0",
        acen: "#f0f0f0",
        gneg: "#d9d9d9",
        gpos25: "#bdbdbd",
        gpos50: "#969696",
        gpos75: "#737373",
        gpos100: "#525252",
    };
}
