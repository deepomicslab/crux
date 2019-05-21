export const BLOCK_NAME = `(svg|canvas|[A-Z][A-z\\d_\\-]+)(?:\\((.+?)\\))?`;
export const BEHAVIOR_BLOCK_NAME = `behavior:([a-z\\d_\\-]+)`;
export const NAME = `[a-z_][A-z0-9_\\-\\.:]*`;
export const FOR_EXPR = `[a-z_][A-z\\.\\[\\]\\d]*`;
export const HELPER = /@([a-z\-]+)\((.+?)\)/g;
