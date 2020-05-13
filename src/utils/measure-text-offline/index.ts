// https://github.com/adambisek/string-pixel-width

import { deburr } from "lodash";
import widthsMap from "./width-map";

const settingsDefaults = { font: "Arial", size: 12 };

export default function measureTextOffline(text: string, settings: any) {
    const sett = { ...settingsDefaults, ...settings };
    const font = sett.font.toLowerCase();
    const size = sett.size;
    const variant = 0 + (sett.bold ? 1 : 0) + (sett.italic ? 2 : 0);
    const map = sett.map || widthsMap;
    const available = Object.keys(map);
    if (available.indexOf(font) === -1) {
        throw new Error(`This font is not supported. Supported fonts are: ${available.join(", ")}`);
    }
    let totalWidth = 0;
    deburr(text)
        .split("")
        .forEach(char => {
            if (/[\x00-\x1F]/.test(char)) {
                return true;
            }
            const widths = map[font][char] || map[font].x;
            const width = widths[variant];
            totalWidth += width;
            return true;
        });
    return totalWidth * (size / 100);
}
