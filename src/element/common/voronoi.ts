import * as d3 from "d3";
import { useTemplate } from "../../ext/decorator";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface VoronoiOption extends ComponentOption {
    data: [number, number][];
}

@useTemplate(`
Component {
    @for (vertice, index) in _vertices{
        Polygon{
            key = index
            points = vertice
            fill = _color(index)
            stroke = "black"
        }
    }
}`)
export class Voronoi extends Component<VoronoiOption> {
    // @ts-ignore
    private _vertices!: d3.VoronoiPolygon<[number, number]>[];
    // @ts-ignore
    private _color!: d3.ScaleOrdinal<string, string>;

    public willRender() {
        const width = this.$geometry.width,
            height = this.$geometry.height;

        const voronoi = d3.voronoi().extent([[0, 0], [width, height]]);
        this._vertices = voronoi.polygons(this.prop.data);
        this._color = d3.scaleOrdinal(d3.schemeCategory10);
    }
}
