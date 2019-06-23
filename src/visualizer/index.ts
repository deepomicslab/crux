import loadData from "../load-data";
import { DataSource } from "../utils/data-loader";
import { Visualizer, VisualizerOption } from "./visualizer";

type VisualizeOption = VisualizerOption & {
    loadData?: Record<string, DataSource<any, any>>;
};

declare global {
    interface Window {
        OVIZ_EXPORT_GLOBAL: boolean;
        OVIZ_VISUALIZER: any;
    }
}

export function visualize(opt: VisualizeOption): Visualizer {
    const v = new Visualizer(opt);
    if (opt.loadData) {
        loadData(opt.loadData).then((d: any) => {
            v.data = { ...v.data, ...d };
            v.run();
            if (window.OVIZ_EXPORT_GLOBAL && window.OVIZ_VISUALIZER) {
                window.OVIZ_VISUALIZER(v);
            }
        });
    } else {
        v.run();
        if (window.OVIZ_EXPORT_GLOBAL && window.OVIZ_VISUALIZER) {
            window.OVIZ_VISUALIZER(v);
        }
    }
    return v;
}
