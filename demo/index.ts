import Crux from "../src/index";

import { registerDefaultBioInfoComponents } from "../src/element/global";

declare global {
    interface Window {
        $v: any;
    }
}

interface Demo {
    template: string;
    data?: any;
    loadData?: any;
    components?: any;
}

registerDefaultBioInfoComponents();

async function init() {
    const demo: Demo = await import("./packages/tree");
    // demo regression plot
    window.$v = Crux.visualize({
        el: "#canvas",
        template: demo.template,

        // loadData
        loadData: { ...(demo.loadData || null) },

        // data
        data: { ...(demo.data || null) },

        // data
        components: { ...(demo.components || null) },
    }).visualizer;
}

document.addEventListener("DOMContentLoaded", init);
