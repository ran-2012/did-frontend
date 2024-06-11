import {Component, createContext, ReactNode, useContext, useEffect, useState} from "react";
import {useAccount, useChainId, useSignMessage} from "wagmi";
import {signMessage} from '@wagmi/core'
import {Api, createSiweMessage, DefaultApi} from "./api.ts";

interface Param {
    children: ReactNode
}

const MyApiDefault = {
    login: (): Promise<void> => {
        return Promise.resolve()
    },
    api: DefaultApi,
    isLogin: false,
}

export type MyApi = typeof MyApiDefault

export const MyApiContext = createContext<MyApi>(Object.assign(MyApiDefault, {
    isLogin: false,
}))

// function saveToken(token: string) {
//
// }
//
// function loadToken(): string | null {
//     return null;
// }
//
// function checkToken(token: string) {
//     return false;
// }

function MyApiProvider(param: Param) {
    const account = useAccount({});
    const signMessage = useSignMessage();
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [api, setApi] = useState<Api | null>(DefaultApi);

    async function login() {
        if (!api) throw new Error("Api not found");
        if (!account.address) throw new Error("Account not found");
        if (!account.chainId) throw new Error("ChainId not found");

        const nonce = await api.getNonce();
        console.log(`nonce: ${nonce}`);
        const message = createSiweMessage(account.address, account.chainId, nonce);
        const signature = await signMessage.signMessageAsync({message});
        console.log(`signature: ${signature}`);
        setIsLogin(true);
    }

    useEffect(() => {
        // const token = loadToken()
        // if (checkToken(token)) {
        //     setIsLogin(true);
        // }
    }, []);

    return (
        <MyApiContext.Provider value={
            Object.assign(MyApiDefault, {
                isLogin,
                api,
                login,
            })}>
            {param.children}
        </MyApiContext.Provider>
    );
}

export function useMyApi() {
    return useContext(MyApiContext)
}

export default MyApiProvider;