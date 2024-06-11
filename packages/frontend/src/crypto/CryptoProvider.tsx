
import {createContext, ReactNode, useContext} from "react";

export interface Param {
    children: ReactNode
}

export const CryptoContext = createContext(Crypto)

export function CryptoProvider(param: Param) {
    return (
        <CryptoContext.Provider value={Crypto}>
            {param.children}
        </CryptoContext.Provider>
    );
}

export function useCrypto() {
    return useContext(CryptoContext);
}
