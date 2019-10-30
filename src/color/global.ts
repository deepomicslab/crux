import { dark, light, Theme, ThemeDef } from "./theme";

const themes: Record<string, Theme> = {
    light, dark,
};

export function getTheme(name: string) {
    if (!(name in themes))
        throw new Error(`Cannot find theme "${name}"`);
    return themes[name];
}

export function getThemeColor(theme: string, color: string = "theme") {
    return getTheme(theme).colors[color].string;
}

export function getThemeScheme(theme: string, scheme: string = "main") {
    return getTheme(theme).schemes[scheme].map(s => s.string);
}

export function registerTheme(name: string, theme: ThemeDef) {
    themes[name] = new Theme(theme);
}
