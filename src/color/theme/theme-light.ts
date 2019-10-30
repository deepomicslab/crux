import { Color } from "../color";
import { Theme } from "./theme";

export const light: Theme = new Theme({
    colors: {
        theme: "#2870eb",
        line: "#000",
        text: "#000",
    },
    schemes: {
        main: [
            [218, 83, 54],
            [36, 90, 60],
            [339, 83, 58],
            [167, 86, 42],
            [275, 86, 60],
            [52, 88, 56],
            [192, 86, 60],
            [304, 66, 66],
            [218, 17, 45],
            [96, 70, 53],
            [24, 70, 45],
            [204, 28, 66],
        ].map(c => Color.hsl.apply(null, c as any).string),
    },
});
