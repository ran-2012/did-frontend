import {Component, createContext, ReactNode, useEffect, useState} from "react";
import {Api, DefaultApi} from "./api.ts";

interface Param {
    children: ReactNode
}

const MyApiDefault = {
    login: login,
    api: DefaultApi,
    isLogin: false,
}

export type MyApi = typeof MyApiDefault

export const MyApiContext = createContext<MyApi>(Object.assign(MyApiDefault, {
    isLogin: false,
}))

async function login() {

}

function saveToken(token: string) {

}

function loadToken(): string | null {
    return null;
}

function checkToken(token: string) {
    return false;
}

function MyApiProvider(param: Param) {
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [api, setApi] = useState<Api | null>(null);

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
            })}>
        </MyApiContext.Provider>
    );
}

export default MyApiProvider;