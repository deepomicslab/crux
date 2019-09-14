import loadData from "../load-data";
import { DataSource } from "../utils/data-loader";
import { Visualizer, VisualizerOption } from "./visualizer";

type VisualizeOption = VisualizerOption & {
    loadData?: Record<string, DataSource<any, any>>;
    setup?: (this: Visualizer) => void;
    didRender?: (this: Visualizer) => void;
};

declare global {
    interface Window {
        OVIZ_EXPORT_GLOBAL: boolean;
        OVIZ_VISUALIZER: any;
    }
}

interface VisualizeResult {
    visualizer: Visualizer;
    option: VisualizeOption;
}

function isVisualizeResult(v: any): v is VisualizeResult {
    return v.visualizer && v.visualizer instanceof Visualizer;
}

export function visualize(arg: VisualizeOption | VisualizeResult): VisualizeResult {
    let v: Visualizer;
    let opt: VisualizeOption;
    if (isVisualizeResult(arg)) {
        v = arg.visualizer;
        opt = arg.option;
    } else {
        opt = arg;
        v = new Visualizer(arg);
    }
    if (opt.loadData) {
        loadData(opt.loadData).then((d: any) => {
            v.data = { ...v.data, ...d };
            if (opt.setup) opt.setup.call(v);
            v.run();
            if (window.OVIZ_EXPORT_GLOBAL && window.OVIZ_VISUALIZER) {
                window.OVIZ_VISUALIZER(v);
            }
            if (opt.didRender) opt.didRender.call(v);
        });
    } else {
        if (opt.setup) opt.setup.call(v);
        v.run();
        if (window.OVIZ_EXPORT_GLOBAL && window.OVIZ_VISUALIZER) {
            window.OVIZ_VISUALIZER(v);
        }
        if (opt.didRender) opt.didRender.call(v);
    }
    return { visualizer: v, option: opt };
}
