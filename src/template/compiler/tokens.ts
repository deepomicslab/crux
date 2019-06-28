export const BLOCK_NAME = `(svg|canvas|[A-Z][A-z\\d_\\-]+)((?:\\.[A-z]+)*)(?:\\((.+?)\\))?`;
export const BEHAVIOR_BLOCK_NAME = `behavior:([a-z\\d_\\-]+)`;
export const STAGE_BLOCK_NAME = `stage:([a-z\\d_\\-]+)`;
export const NAME = `[a-z_][A-z0-9_\\-\\.:]*`;
export const PROP_NAME = `[a-z_][A-z0-9_\\-\\.:\\(\\)]*`;
export const FOR_EXPR = `[\\w\\.\\[\\]\\d"\\(\\)]+`;
export const HELPER = /@([a-z\-]+)\((.+?)\)/g;
