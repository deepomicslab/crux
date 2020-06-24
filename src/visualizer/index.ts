import loadData from "../load-data";
import { DataSource } from "../utils/data-loader";
import IS_NODE from "../utils/is-node";
import { Visualizer, VisualizerOption } from "./visualizer";

type VisualizeOption = VisualizerOption & {
    loadData?: Record<string, DataSource<any, any>>;
    setup?: (this: Visualizer) => void;
    _willLoadData?: (this: Visualizer, def: any) => void;
    _didRender?: (this: Visualizer) => void;
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
        if (opt._didRender) opt._didRender.call(v);
    }

    let needLoadData = !!opt.loadData;
    const dataDefFromCommands = {};

    if (v.extCommands) {
        for (const cmd of v.extCommands) {
            if (cmd.type === "load") {
                needLoadData = true;
                dataDefFromCommands[cmd.name] = new Function(`return ${cmd.payload}`)();
            }
        }
    }

    if (needLoadData) {
        const dataDef = { ...opt.loadData, ...dataDefFromCommands };
        if (opt._willLoadData) opt._willLoadData.call(v, dataDef);
        loadData(dataDef).then((d: any) => {
            v.data = { ...v.data, ...d };
            run();
        });
    } else {
        run();
    }
    return { visualizer: v, option: opt };
}
