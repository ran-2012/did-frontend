import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {useAccount, useSignMessage} from "wagmi";
import {SiweRequest} from "@did-demo/common";
import {LocalStorage} from "../utility/storage.ts";
import {Api, createSiweMessage, DefaultApi} from "./api.ts";

interface Param {
    children: ReactNode
}

export interface MyApi {
    login: (() => Promise<boolean>),
    logout: (() => Promise<boolean>),
    api: Api | null,
    isLogin: boolean,
}

const MyApiDefault: MyApi = {
    login: async () => {
        throw new Error('Not implemented')
    },
    logout: async () => {
        throw new Error('Not implemented')
    },
    api: DefaultApi,
    isLogin: false,
}

export const MyApiContext = createContext<MyApi>(Object.assign(MyApiDefault, {
    isLogin: false,
}))

function saveToken(siweRequest: SiweRequest) {
    LocalStorage.save('siweRequest', siweRequest);
}

function loadToken(): SiweRequest | null {
    return LocalStorage.load('siweRequest') as SiweRequest;
}

function removeToken() {
    LocalStorage.remove('siweRequest');
}

function MyApiProvider(param: Param) {
    const account = useAccount({});
    const signMessage = useSignMessage();
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [api, setApi] = useState<Api>(DefaultApi);

    async function login(): Promise<boolean> {
        if (!account.isConnected) {
            console.log('Not connected');
            return false;
        }

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
                setIsLogin(isValid);
                return true;
            }
        }
        const nonce = await api.getNonce();
        console.log(`nonce: ${nonce}`);
        const message = createSiweMessage(account.address, account.chainId, nonce);
        const signature = await signMessage.signMessageAsync({message});
        const isValid = await api.verify(message, signature);
        if (isValid) {
            console.log("Save token")
            saveToken({message, signature});
        }
        setIsLogin(isValid);
        return isValid;
    }

    async function logout(): Promise<boolean> {
        removeToken();
        setIsLogin(false);
        return true;
    }

    useEffect(() => {
        console.log('is login: ' + isLogin);
    }, [isLogin]);

    return (
        <MyApiContext.Provider value={{
            isLogin,
            api,
            login,
            logout,
        }}>
            {param.children}
        </MyApiContext.Provider>
    );
}

export function useMyApi() {
    return useContext(MyApiContext)
}

export default MyApiProvider;