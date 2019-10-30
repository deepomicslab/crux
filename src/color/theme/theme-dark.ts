import { Color } from "../color";
import { Theme } from "./theme";

export const dark: Theme = new Theme({
    colors: {
        theme: "#3d81f5",
        line: "#fff",
        text: "#fff",
    },
    schemes: {
        main: [
            [218, 92, 65],
            [36, 94, 65],
            [339, 88, 67],
            [167, 88, 50],
            [275, 90, 71],
            [52, 100, 70],
            [192, 88, 64],
            [304, 76, 72],
            [218, 17, 58],
            [96, 80, 65],
            [18, 72, 60],
            [204, 28, 80],
        ].map(c => Color.hsl.apply(null, c as any).string),
    },
});
