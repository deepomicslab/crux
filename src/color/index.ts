import { getThemeScheme } from "./global";
import { ColorSchemeCategory, ColorSchemeGradient, ColorSchemeGradientOptions } from "./scheme";

export * from "./theme";
export * from "./color";
export * from "./scheme";
export { getThemeColor, getThemeScheme } from "./global";

export function schemeCategory(theme: string, k: number | (string | number)[], scheme: string = "main") {
    const colors = getThemeScheme(theme, scheme);
    return ColorSchemeCategory.create(k, colors);
}

export function schemeCategoryAuto(k: number | (string | number)[], initialColor?: string) {
    return ColorSchemeCategory.create(k, undefined, initialColor);
}

export function schemeGradient(start: string, end: string, options?: ColorSchemeGradientOptions) {
    return ColorSchemeGradient.create(start, end, options);
}
