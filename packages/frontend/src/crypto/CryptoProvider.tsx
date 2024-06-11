import {createContext, ReactNode, useContext, useState} from "react";
import * as _Crypto from './crypto'

export interface Param {
    children: ReactNode
}

const Crypto = {
    ..._Crypto,
    key: false,
    createKeyPair: async (seed: string | null = null, save: boolean = true) =>
        Promise<ReturnType<typeof _Crypto.createKeyPair>>
}
export type MyCrypto = typeof Crypto;

export const CryptoContext = createContext<MyCrypto>(Crypto)

export function CryptoProvider(param: Param) {
    const [hasKey, setHasKey] = useState(_Crypto.hasKeyPair());
    return (
        <CryptoContext.Provider value={Object.assign(Crypto, {
            key: hasKey,
            createKeyPair: async (seed: string | null = null, save: boolean = true) => {
                const key = await _Crypto.createKeyPair(seed, save);
                setHasKey(true);
                return key;
            }
        })}>
            {param.children}
        </CryptoContext.Provider>
    );
}

export function useCrypto() {
    return useContext(CryptoContext);
}
