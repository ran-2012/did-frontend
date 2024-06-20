import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {pki} from "node-forge";
import {useAccount} from "wagmi";
import {useMyApi} from "../myapi/MyApiProvider.tsx";
import * as _Crypto from './crypto'

export interface Param {
    children: ReactNode
}

const Crypto = {
    crypto: _Crypto,
    hasKey: false,
    pkHash: '',
    createKeyPair: (seed: string | null = null, save: boolean = true) => Promise.resolve(),
    saveKeyPair: (seed: string, pk: pki.rsa.PublicKey, sk: pki.rsa.PrivateKey) => {
    }
}

export type MyCrypto = typeof Crypto;

export const CryptoContext = createContext<MyCrypto>(Crypto)

export function CryptoProvider(param: Param) {
    const {isLogin} = useMyApi();
    const [hasKey, setHasKey] = useState(_Crypto.hasKeyPair());
    const [pkHash, setPkHash] = useState<string>('');

    useEffect(() => {
        const hasKey = _Crypto.hasKeyPair()
        console.log('hasKey: ' + hasKey)
        setHasKey(hasKey);
        if (hasKey) {
            setPkHash(_Crypto.getPkHash());
        } else {
            setPkHash('');
        }
    }, [isLogin]);

    return (
        <CryptoContext.Provider value={{
            crypto: _Crypto,
            hasKey,
            pkHash,
            createKeyPair: async (seed: string | null = null, save: boolean = true) => {
                await _Crypto.createKeyPair(seed, save!);
                setHasKey(true);
                setPkHash(_Crypto.getPkHash());
            },
            saveKeyPair: (seed: string, pk: pki.rsa.PublicKey | string, sk: pki.rsa.PrivateKey | string) => {
                _Crypto.savePublicKey(seed, pk);
                _Crypto.savePrivateKey(seed, sk);
                setHasKey(true);
            }
        }}>
            {param.children}
        </CryptoContext.Provider>
    );
}

export function useMyCrypto() {
    return useContext(CryptoContext);
}
