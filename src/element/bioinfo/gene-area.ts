import { stackedLayout } from "../../algo";
import { getThemeColor } from "../../color";
import { Anchor, GeometryUnit, GeometryValue } from "../../defs/geometry";
import { GeneData } from "../../utils/bioinfo/gene";
import { max, min } from "../../utils/math";
import { measuredTextSize } from "../../utils/text-size";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

type ScaledGeneData = GeneData & {
    _x0?: number;
    _x1?: number;
    _labelWidth?: number;
};

export interface GeneAreaOption extends ComponentOption {
    genes: ScaledGeneData[];
    rowHeight: number;
    exonHeight: number;
    intronHeight: number;
    rowGap: number;
    displayExon: boolean;
    displayDirection: boolean;
    activeGenes: string[];
    markerColor: string;
    layout: "packed" | "merged";
    labelPos: "innerLeft" | "right" | "none";
    labelText: (g: GeneData) => string;
    labelSize: number;
}

export class GeneArea extends Component<GeneAreaOption> {
    public render() {
        return this.t`Component {
            x = prop.x
            y = prop.y
            width = prop.width
            height = calculatedHeight
            xScale = geneScale
            clip = @clip("bound")

            @for (genes, layer) in layers {
                @for (gene, index) in genes {
                    @let geneName = prop.labelText(gene)
                    Component {
                        context = gene
                        ref    = "genes[]"
                        key    = gene.trans_name_orig
                        x      = gene._x0
                        y      = layer * (prop.exonHeight + prop.rowGap) + prop.rowGap * 0.5
                        width  = Math.max(gene._x1 - gene._x0, 1)
                        height = prop.rowHeight
                        stage  = isGeneActive(gene) ? "active": null
                        on:mouseenter = (_, el) => setFocusedGene(el.prop.context.trans_name)
                        on:mouseleave = setFocusedGene(null)
                        @props prop.opt.gene

                        @if prop.displayPromoters {
                            Rect {
                            }
                        }
                        Rect {
                            width  = 100%
                            height = 100%
                            fill   = "none"
                            @props prop.opt.bg
                        }
                        Rect {
                            anchor = @anchor("left", "middle")
                            y      = 50%
                            width  = 100%
                            height = prop.intronHeight
                            fill   = prop.geneColor(gene)
                            @props prop.opt.intron
                            behavior:tooltip {
                                content = gene.trans_name_orig + "<br>" + gene.most_left_pos + "-" + gene.most_right_pos
                            }
                        }
                        @if prop.displayExon {
                            @for (exon, index) in gene.exons {
                                @let el = exon.most_left_pos
                                @let er = exon.most_left_pos + exon.length
                                Rect {
                                    key      = "ex" + index
                                    x        = @scaledX(el) - gene._x0
                                    width    = Math.max(@scaledX(er) - @scaledX(el), 1)
                                    height   = 100%
                                    minWidth = 1
                                    fill     = prop.geneColor(gene)
                                    @props prop.opt.exon
                                    behavior:tooltip {
                                        content = "Exon " + getExonIndex(gene, index) + ": " + el + "-" + er
                                    }
                                }
                            }
                        }
                        @if prop.displayDirection {
                            Path {
                                y = 50%
                                d = genMarker(gene)
                                markerMid = "url(#genearea-marker)"
                                fill = "none"
                                stroke = "none"
                                events = "none"
                            }
                        }
                        Text {
                            text = geneName
                            visible = gene._x0 < $geometry.width
                            y = 50%
                            anchor = @anchor("left", "middle")
                            fontSize = prop.labelSize
                            @props getGeneLabelProps(gene)
                            @props prop.opt.label
                        }
                    }
                }
            }
        }`;
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            rowHeight: 20,
            exonHeight: 20,
            intronHeight: 4,
            rowGap: 4,
            activeGenes: [],
            geneColor: (gene: GeneData) => gene.color || "#66f",
            layout: "packed",
            labelPos: "innerLeft",
            labelText: (gene: GeneData) => gene.trans_name_orig,
            labelSize: 12,
        };
    }

    public state = {
        stage: null,
        focusedGene: null,
    };

    private geneScale!: any;
    // @ts-ignore
    private layers!: ScaledGeneData[][];

    public willRender() {
        const parentScale = this.getScale(true);
        this.geneScale = parentScale
            ? undefined
            : this._createScale("linear", true, [this.geneMinPos, this.geneMaxPos]);
        const scale = parentScale || this.geneScale;
        this.prop.genes!.forEach(g => {
            g._x0 = scale(g.most_left_pos);
            g._x1 = scale(g.most_right_pos);
        });
        this.layers = this.layout();

        if (this.prop.displayDirection) {
            const markerColor = this.prop.markerColor || getThemeColor(this.$v.theme, "line");
            this.$v.rendererCtx.appendDef(
                "genearea-marker",
                "marker",
                {
                    orient: "auto",
                    markerWidth: "4",
                    markerHeight: "6",
                    refX: "1.5",
                    refY: "2.5",
                },
                `<path d="M0,0 L3,2.5 L0,5" fill="none" stroke-opacity="1" stroke="${markerColor}"></path>`,
            );
        }
    }

    public didLayoutSubTree() {
        this._updateGeometry("height", this.calculatedHeight);
    }

    public layout(): ScaledGeneData[][] {
        this.prop.genes!.forEach(g => {
            g._labelWidth = measuredTextSize(this.prop.labelText(g), this.prop.labelSize).width + 2;
        });
        if (this.prop.layout === "packed") {
            return stackedLayout(this.prop.genes!)
                .value(x => x._x0!)
                .extent(x => [x._x0!, this.prop.labelPos === "right" ? x._x1! + x._labelWidth! : x._x1!])
                .run();
        } else if (this.prop.layout === "merged") {
            return [this.prop.genes!];
        }
        return [];
    }

    public get geneMinPos(): number {
        if (this.prop.genes.length === 0) return 0;
        return min(this.prop.genes, g => g.most_left_pos as number)!;
    }

    public get geneMaxPos(): number {
        if (this.prop.genes.length === 0) return 0;
        return max(this.prop.genes, g => g.most_right_pos as number)!;
    }

    // @ts-ignore
    public getExonIndex(gene: ScaledGeneData, index: number) {
        return gene.strand === "-" ? gene.exon_number - index : index + 1;
    }

    // @ts-ignore
    private getGeneLabelProps(gene: ScaledGeneData) {
        switch (this.prop.labelPos) {
            case "innerLeft":
                return { x: gene._x0! < 0 ? -gene._x0! : 0 };
            case "right":
                const width = this.$geometry.width;
                if (gene._x1! + gene._labelWidth! > width) {
                    return {
                        x: width - gene._x0! - 1,
                        y: GeometryValue.create(50, GeometryUnit.Percent, 2),
                        anchor: Anchor.Right | Anchor.Top,
                    };
                }
                return { x: gene._x1! - gene._x0! + 2 };
        }
    }

    // @ts-ignore
    private isGeneActive(gene) {
        return this.state.focusedGene === gene.trans_name || this.prop.activeGenes.indexOf(gene.trans_name) >= 0;
    }

    // @ts-ignore
    private setFocusedGene(gene) {
        this.setState({ focusedGene: gene });
    }

    private get calculatedHeight(): number {
        return this.layers.length * (this.prop.exonHeight + this.prop.rowGap) + this.prop.rowGap;
    }

    public getGenes(position: number): Component[] {
        return (this.$ref.genes as Component[]).filter(
            g => g.prop.context.most_left_pos <= position && g.prop.context.most_right_pos >= position,
        );
    }

    // @ts-ignore
    private genMarker(gene) {
        const width = gene._x1 - gene._x0;
        const num = Math.floor(width / 16);
        if (num < 2) {
            const mid = width / 2;
            if (gene.strand === "-") return `M${width},0 L${mid},0 L0,0`;
            else return `M0,0 L${mid},0 L${width},0`;
        }
        let str: string;
        if (gene.strand === "-") {
            str = `M${width},0`;
            for (let i = num - 1; i > 0; i--) {
                str += ` L${i * 16},0`;
            }
            str += `L0,0`;
        } else {
            str = `M0,0`;
            for (let i = 1; i < num; i++) {
                str += ` L${i * 16},0`;
            }
            str += `L${width},0`;
        }
        return str;
    }
}
