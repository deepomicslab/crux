import loadData from "../load-data";
import { DataSource } from "../utils/data-loader";
import IS_NODE from "../utils/is-node";
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

    function run() {
        if (opt.setup) opt.setup.call(v);
        v.run();
        if (!IS_NODE && window.OVIZ_EXPORT_GLOBAL && window.OVIZ_VISUALIZER) {
            window.OVIZ_VISUALIZER(v);
        }
        if (opt.didRender) opt.didRender.call(v);
    }

    if (opt.loadData) {
        loadData(opt.loadData).then((d: any) => {
            v.data = { ...v.data, ...d };
            run();
        });
    } else {
        run();
    }
    return { visualizer: v, option: opt };
}
