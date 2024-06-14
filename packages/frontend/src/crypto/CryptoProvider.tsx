import {createContext, ReactNode, useContext, useState} from "react";
import {pki} from "node-forge";
import * as _Crypto from './crypto'

export interface Param {
    children: ReactNode
}

export interface MyCrypto {
    key: boolean,
    createKeyPair?: (seed: string | null, save: boolean) => Promise<{
        pk: pki.rsa.PublicKey,
        sk: pki.rsa.PrivateKey
    } | null>
}

const Crypto: MyCrypto = {
    ..._Crypto,
    key: false,
    createKeyPair: (_, __) => Promise.resolve(null)
}

export const CryptoContext = createContext<MyCrypto>(Crypto)

export function CryptoProvider(param: Param) {
    const [hasKey, setHasKey] = useState(_Crypto.hasKeyPair());
    return (
        <CryptoContext.Provider value={{
            key: hasKey,
            createKeyPair: async (seed: string | null = null, save: boolean = true) => {
                const key = await _Crypto.createKeyPair(seed, save);
                setHasKey(true);
                return key;
            }
        }}>
            {param.children}
        </CryptoContext.Provider>
    );
}

export function useMyCrypto() {
    return useContext(CryptoContext);
}
