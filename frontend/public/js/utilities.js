const boolEnv = new Set(['yes', '1', 'true', 'on', 'ok'])

export default function asBool(value) {
    if (typeof value !== 'string') {
        value = String(value);
    }
    return boolEnv.has(value.toLowerCase().trim());
}