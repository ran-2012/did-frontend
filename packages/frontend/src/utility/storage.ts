export interface StorageSaveParam {
    encrypt: boolean;
    serializeFunc: (value: unknown) => string;
}

export interface StorageLoadParam {
    decrypt: boolean;
    deserializeFunc: (value: string) => unknown;
}

export class Storage {
    save(key: string, value: unknown, param: StorageSaveParam | null = null): void {
        throw new Error('Not implemented')
    }

    load(key: string, param: StorageLoadParam | null = null): unknown | null {
        throw new Error('Not implemented')
    }
}

function defaultSerializeFunc(value: unknown) {
    return JSON.stringify({value})
}

function defaultDeserializeFunc(value: string) {
    return JSON.parse(value).value
}

export class _LocalStorage extends Storage {
    save(key: string, value: unknown, param: StorageSaveParam | null = null) {
        const serializeFunc = param?.serializeFunc || defaultSerializeFunc
        localStorage.setItem(key, serializeFunc(value))
    }

    load(key: string, param: StorageLoadParam | null = null): unknown | null {
        const deserializeFunc = param?.deserializeFunc || defaultDeserializeFunc
        const res = localStorage.getItem(key)
        if (!res) {
            return null
        }
        return deserializeFunc(res)
    }
}

export class MemoryStorage extends Storage {
    map = new Map<string, string>()

    save(key: string, value: unknown, param: StorageSaveParam | null = null) {
        const serializeFunc = param?.serializeFunc || defaultSerializeFunc
        this.map.set(key, serializeFunc(value))
    }

    load(key: string, param: StorageLoadParam | null = null): unknown | null {
        const deserializeFunc = param?.deserializeFunc || defaultDeserializeFunc
        const res = this.map.get(key)
        if (!res) {
            return null
        }
        return deserializeFunc(res)
    }
}

let _ls: Storage = new _LocalStorage();
if (import.meta.env.VITEST) {
    _ls = new MemoryStorage();
}

export const LocalStorage = _ls;
