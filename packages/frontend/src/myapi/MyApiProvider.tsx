import {Component, createContext, ReactNode, useState} from "react";
import {Api, DefaultApi} from "./api.ts";

interface Param {
    children: ReactNode
}

interface MyApiVolatile {
    isLogin: boolean;
}

const myApiDefault = {
    login: login,
    api: DefaultApi
}

type MyApiDefault = typeof myApiDefault;

export type MyApi = MyApiVolatile & MyApiDefault;

export const MyApiContext = createContext<MyApi>(Object.assign({
    isLogin: false,
}, myApiDefault))

async function login() {

}

function MyApiProvider(param: Param) {
    const [isLogin, setIsLogin] = useState<boolean>(false);
    const [api, setApi] = useState<Api | null>(null);

    return (
        <MyApiContext.Provider value={
            Object.assign({
                isLogin,
                api,
            }, myApiDefault)}>
        </MyApiContext.Provider>
    );
}

export default MyApiProvider;