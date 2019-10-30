// @ts-ignore
import * as venn from "venn.js";
import { ColorSchemeCategory, schemeCategory } from "../../color";
import { template } from "../../template/tag";
import { Component } from "../component";
import { ComponentOption } from "../component-options";

export interface VennOption extends ComponentOption {
    data: VennDiagramEntry[];
    categories: string[];
    radius: number;
    stroke: string;
    opacity: number;
    normalize: boolean;
    padding: number;
    orientation: number;
}

export interface VennDiagramEntry {
    sets: string[];
    size: number;
    label: string;
}

// tslint:disable-next-line:class-name
interface _VennEntry {
    sets: string[];
    _set: Set<string>;
    size: number;
    label: string;
}

const SMALL = 1e-10;

export class VennDiagram extends Component<VennOption> {
    public render = template`
    Component {
        @if (_data !== null) {
            @for (c, k) in _data.circles {
                @let color = _colorScheme.get(k)
                Component {
                    key = "c" + k
                    Circle.centered {
                        x = c.x
                        y = c.y
                        r = c.radius
                        fill = color
                        stroke = color
                        fillOpacity = prop.opacity
                    }
                }
            }
            @for (a, k) in _data.intersections {
                Component {
                    key = "i" + k
                    Path {
                        d = a.path
                        fill = prop.opt.intersectionFill ? prop.opt.intersectionFill : "none"
                        stroke = prop.opt.intersectionStroke ? prop.opt.intersectionStroke : "black"
                        @let isw = prop.opt.intersectionStrokeWidth ? prop.opt.intersectionStrokeWidth : prop.strokeWidth
                        style:stroke-width = a.key.length === 3 ? isw * 2 : isw
                    }
                }
            }
            @for (t, k) in _data.textCenters {
                Component {
                    key = "t" + k
                    Text {
                        x = t.x; y = t.y
                        text = k
                    }
                }
            }
            @yield legend with legendData
        }
        @else {
            Text {
                text = "Input data is in wrong format"
            }
        }
    }
    `;

    // @ts-ignore
    private _colorScheme: ColorSchemeCategory<any>;
    // @ts-ignore
    private _data: any;

    public willRender() {
        const baseCategories = new Set<string>();
        let data: _VennEntry[];
        try {
            data = this.prop.data.map(({ sets, size, label }) => {
                if (sets.length === 1) baseCategories.add(sets[0]);
                return {
                    sets,
                    _set: new Set(sets),
                    size,
                    label: label || sets.join(""),
                };
            });
        } catch (e) {
            data = [];
        }
        this._colorScheme = schemeCategory(this.$v.theme, [...baseCategories.values()]);
        this._data = this.getChartData(data);
    }

    private getChartData(data: _VennEntry[]) {
        try {
            const layoutFunction = venn.venn;
            const loss = venn.lossFunction;
            const toRemove: string[] = [];
            data.forEach((d) => {
                if (d.size === 0 && d.sets.length === 1) {
                    toRemove.push(d.sets[0]);
                }
            });
            data = data.filter(d => !toRemove.some(s => d._set.has(s)));
            let circles = {};
            let textCenters = {};
            let intersections = {};
            if (data.length > 0) {
                let solution = layoutFunction(data, { lossFunction: loss });
                if (this.prop.normalize) {
                    solution = venn.normalizeSolution(solution, this.prop.orientation, null);
                }
                circles = venn.scaleSolution(solution, this.$geometry.width, this.$geometry.height, this.prop.padding);
                textCenters = venn.computeTextCentres(circles, data);
                intersections = this.getIntersections(circles);
            } else {
                throw new Error(`Venn: No available data.`);
            }
            return { circles, intersections, textCenters };
        } catch (e) {
            return null;
        }
    }

    private getIntersections(circles: any) {
        const circleArray: any[] = [];
        Object.keys(circles).map((key, index) => {
            const circle = circles[key];
            circle.key = key;
            circleArray.push(circle);
        });
        const intersectionPoints = [];
        for (let i = 0; i < circleArray.length; ++i) {
            for (let j = i + 1; j < circleArray.length; ++j) {
                const intersect = venn.circleCircleIntersection(circleArray[i], circleArray[j]);
                for (const point of intersect) {
                    const p = point;
                    p.parentIndex = [i, j];
                    p.parentKey = [circleArray[i].key, circleArray[j].key];
                    intersectionPoints.push(p);
                }
            }
        }

        const intersectionAreas = [];
        // 2 circles intersection
        if (circleArray.length >= 2) {
            for (let i = 0; i < circleArray.length; ++i) {
                const cA = circleArray[i];
                for (let j = i + 1; j < circleArray.length; ++j) {
                    const cB = circleArray[j];
                    const points = [];
                    for (const p of intersectionPoints) {
                        if (p.parentKey.indexOf(cA.key) !== -1 && p.parentKey.indexOf(cB.key) !== -1) {
                            points.push(p);
                        }
                    }
                    // console.log("points", points);
                    const area = `M ${points[0].x} ${points[0].y} \
                    A ${cA.radius} ${cA.radius} 0 0 0 ${points[1].x} ${points[1].y} \
                    A ${cB.radius} ${cB.radius} 0 0 0 ${points[0].x} ${points[0].y}`;
                    intersectionAreas.push({ key: [cA.key, cB.key], label: cA.key + cB.key, path: area });
                }
            }
        }

        // 3 circles intersection
        if (circleArray.length >= 3) {
            for (let i = 0; i < circleArray.length; ++i) {
                const cA = circleArray[i];
                for (let j = i + 1; j < circleArray.length; ++j) {
                    const cB = circleArray[j];
                    for (let k = j + 1; k < circleArray.length; ++k) {
                        const cC = circleArray[k];
                        const points = [];
                        for (const p of intersectionPoints) {
                            if (p.parentKey.indexOf(cA.key) !== -1 && p.parentKey.indexOf(cC.key) !== -1) {
                                if (this.inCircle(p, cB)) {
                                    points.push(p);
                                }
                            } else if (p.parentKey.indexOf(cB.key) !== -1 && p.parentKey.indexOf(cC.key) !== -1) {
                                if (this.inCircle(p, cA)) {
                                    points.push(p);
                                }
                            } else if (p.parentKey.indexOf(cA.key) !== -1 && p.parentKey.indexOf(cB.key) !== -1) {
                                if (this.inCircle(p, cC)) {
                                    points.push(p);
                                }
                            }
                        }
                        // console.log("points", points);
                        let area = ``;
                        for (let q = 0; q < 3; q++) {
                            const pA = points[q];
                            for (let p = q + 1; p < 3; p++) {
                                area += ` M ${pA.x} ${pA.y}`;
                                const pB = points[p];
                                const key = pA.parentKey.filter((v: string) => pB.parentKey.indexOf(v) !== -1)[0];
                                const areaTmp = ` A ${circles[key].radius} ${circles[key].radius} 0 0 \
                                ${this.clockWise(pA, pB, circles[key]) ? 0 : 1} ${pB.x} ${pB.y}`;
                                area += areaTmp;
                            }
                        }
                        intersectionAreas.push({key: [cA.key, cB.key, cC.key], label: cA.key + cB.key + cC.key, path: area});
                    }
                }
            }
        }
        return intersectionAreas;
    }

    private inCircle(point: any, circle: any) {
        return !(venn.distance(point, circle) > circle.radius + SMALL);
    }

    private clockWise(a: any, b: any, o: any) {
        // o -> a -> b
        return (o.x * a.y - a.x * o.y) + (a.x * b.y - b.x * a.y) + (b.x * o.y - o.x * b.y) < 0;
    }

    public defaultProp() {
        return {
            ...super.defaultProp(),
            radius: 50,
            opacity: 0.5,
            normalize: false,
            width: 600,
            height: 350,
            padding: 15,
            orientation: Math.PI / 2,
            strokeWidth: 1,
        };
    }

    // @ts-ignore
    private get legendData() {
        return this._colorScheme.legendData();
    }
}
