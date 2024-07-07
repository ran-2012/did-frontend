import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {useAccount, useSignMessage} from "wagmi";
import {SiweRequest} from "@did-demo/common";
import {Simulate} from "react-dom/test-utils";
import {LocalStorage} from "../utility/storage.ts";
import {useMasca} from "../masca/utility.ts";
import {Api, createSiweMessage} from "./api.ts";

interface Param {
    children: ReactNode
}

export interface MyApi {
    login: (() => Promise<boolean>),
    logout: (() => Promise<boolean>),
    api: Api,
    isLogin: boolean,
    user: string,
}

const MyApiDefault: MyApi = {
    login: async () => {
        throw new Error('Not implemented')
    },
    logout: async () => {
        throw new Error('Not implemented')
    },
    api: new Api(loadToken() ? JSON.stringify(loadToken()) : ''),
    isLogin: false,
    user: '',
}

export const MyApiContext = createContext<MyApi>(Object.assign(MyApiDefault, {
    isLogin: hasToken(),
}))

function saveToken(siweRequest: SiweRequest) {
    LocalStorage.save('siweRequest', siweRequest);
}

function loadToken(user: string = ''): SiweRequest | null {
    return LocalStorage.load(`siweRequest`) as SiweRequest;
}

function removeToken() {
    LocalStorage.remove('siweRequest');
}

function hasToken() {
    return loadToken() != null;
}

function MyApiProvider(param: Param) {
    const account = useAccount();
    const [user, setUser] = useState<string>(account.address ?? '');
    const signMessage = useSignMessage();
    const [isLogin, setIsLogin] = useState<boolean>(hasToken());
    const api = useRef(MyApiDefault.api);

    useEffect(() => {
        if (account.address && account.isConnected) {
            console.log('Account changed: ' + account.address);
            setUser(account.address ?? '');
            LocalStorage.setPrefix(account.address);

            if (loadToken()) {
                login().catch((e) => {
                    console.error(e);
                })
            }
        }
    }, [account.address, account.isConnected]);

    useEffect(() => {
        if (user && user != account.address) {
            console.log('User changed')
            logout().then()
        } else if (account.isDisconnected) {
            console.log('Account disconnected')
            logout().then();
        }
    }, [account.address, account.isDisconnected]);

    async function login(): Promise<boolean> {
        console.log("address: " + account.address);
        if (!account.isConnected) {
            console.log('Not connected');
            return false;
        }

        if (isLogin) {
            console.log('Already login');
            return true;
        }
        if (!account.address) throw new Error("Account not found");
        if (!account.chainId) throw new Error("ChainId not found");

        LocalStorage.setPrefix(account.address);
        const savedToken = loadToken();

        if (savedToken) {
            console.log('Found saved token')
            const isValid = await api.current.verify(savedToken.message, savedToken.signature);

            if (isValid) {
                setIsLogin(isValid);
                return true;
            } else {
                console.log('Invalid saved token');
            }
        }
        const nonce = await api.current.getNonce();
        console.log(`nonce: ${nonce}`);
        const message = createSiweMessage(account.address, account.chainId, nonce);
        const signature = await signMessage.signMessageAsync({message});

        const isValid = await api.current.verify(message, signature);
        if (isValid) {
            console.log("Save token")
            api.current.setToken(JSON.stringify({message, signature}));
            saveToken({message, signature});
        } else {
            LocalStorage.setPrefix('');
        }

        setIsLogin(isValid);
        return isValid;
    }

    async function logout(): Promise<boolean> {
        removeToken();
        setIsLogin(false);
        LocalStorage.setPrefix('');
        return true;
    }

    useEffect(() => {
        console.log('is login: ' + isLogin);
    }, [isLogin]);

    return (
        <MyApiContext.Provider value={{
            isLogin,
            api: api.current,
            user,
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