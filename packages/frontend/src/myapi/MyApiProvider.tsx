import {Component, createContext, ReactNode, useContext, useEffect, useState} from "react";
import {useAccount, useChainId, useSignMessage} from "wagmi";
import {signMessage} from '@wagmi/core'
import {SiweRequest} from "@did-demo/common";
import {LocalStorage, Storage} from "../utility/storage.ts";
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

function saveToken(siweRequest: SiweRequest) {
    LocalStorage.save('siweRequest', siweRequest);
}

function loadToken(): SiweRequest | null {
    return LocalStorage.load('siweRequest') as SiweRequest;
}


function MyApiProvider(param: Param) {
    const account = useAccount({});
    const signMessage = useSignMessage();
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [api, setApi] = useState<Api | null>(DefaultApi);

    async function login(): Promise<boolean> {
        if (isLogin) {
            console.log('Already login');
            return true;
        }
        if (!api) throw new Error("Api not found");
        if (!account.address) throw new Error("Account not found");
        if (!account.chainId) throw new Error("ChainId not found");

        const savedToken = loadToken();
        if (savedToken) {
            console.log('Found saved token')
            const isValid = await api.verify(savedToken.message, savedToken.signature);

            if (isValid) {
                console.log()
                setIsLogin(isValid);
                return true;
            }
        }
        const nonce = await api.getNonce();
        console.log(`nonce: ${nonce}`);
        const message = createSiweMessage(account.address, account.chainId, nonce);
        const signature = await signMessage.signMessageAsync({message});
        console.log(`signature: ${signature}`);
        const isValid = await api.verify(message, signature);
        if (isValid) {
            saveToken({message, signature});
        }
        setIsLogin(isValid);
        return isValid;
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