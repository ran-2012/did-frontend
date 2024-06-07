import {
    enableMasca,
    isError, Masca,
    MascaApi,
    QueryCredentialsRequestResult,
    Result
} from '@blockchain-lab-um/masca-connector';
import {Hex} from "viem";
import {useContext} from "react";
import {MetaMaskInpageProvider} from "@metamask/providers";
import toast from "../toast.ts";
import {MascaContext} from "./MascaProvider.tsx";
import {MascaConfig} from "./config.ts";

// VC with metadata which is used for managing vc storage in snap
export type VC = QueryCredentialsRequestResult;

async function checkInstalledMasca() {
    const metaMaskProvider = window.ethereum as MetaMaskInpageProvider;
    if (!metaMaskProvider) {
        toast.error("MetaMask not installed")
        return false;
    }
    const result = await metaMaskProvider.request({
        method: 'wallet_getSnaps',
        params: [],
    }) as Map<string, { version: string, id: string }>

    console.log(JSON.stringify(result, null, 2));
}

async function connectMasca(address: Hex) {

    const enableResult = await enableMasca(address, {
        snapId: MascaConfig.snapId, // Defaults to `npm:@blockchain-lab-um/masca`
        version: MascaConfig.snapVersion, // Defaults to the latest released version
        supportedMethods: ['did:ethr', 'did:pkh'], // Defaults to all available methods
    });

    console.log("connect result" + enableResult);
    if (isError(enableResult)) {
        console.error(enableResult.error)
        throw new Error(enableResult.error);
    } else {
        localStorage.setItem('masca-connected', '1');
        return enableResult.data.getMascaApi()
    }
}

export interface CallWrapperParam {
    infoMsg?: string
    successMsg?: string
    errorMsg?: string,
    isLoading?: (loading: boolean) => void,
}

// export type AllowOnly<T, K extends keyof T> = Pick<T, K> & { [P in keyof Omit<T, K>]?: never }
// export type OneOf<T, K = keyof T> = K extends keyof T ? AllowOnly<T, K> : never
// type MascaFn = MascaApi[keyof MascaApi];

export function useMascaCallWrapper() {
    const masca = useMasca();

    return {
        async call<Param extends unknown[], Data>
        (fn: ((..._: Param) => Promise<Result<Data>>) | undefined,
         param: CallWrapperParam, ...args: Param): Promise<Result<Data>> {
            return callWrapper(masca.api, fn, param, ...args)
        }
    };
}

async function callWrapper<Param extends unknown[], Data>
(mascaApi: MascaApi | null, fn: ((..._: Param) => Promise<Result<Data>>) | undefined, callWrapperParam: CallWrapperParam, ...param: Param): Promise<Result<Data>> {
    if (!mascaApi || !fn) {
        toast.error("Masca not connected")
        return {
            success: false,
            error: 'Masca not connected'
        }
    }
    return _callWrapper(fn.call(mascaApi, ...param), callWrapperParam)
}

async function _callWrapper<Data>(promise: Promise<Result<Data>> | undefined, param: CallWrapperParam): Promise<Result<Data>> {
    if (param.infoMsg) {
        toast.info(param.infoMsg)
    }
    param.isLoading?.(true);
    const res = await promise;
    param.isLoading?.(false);
    if (!res) {
        console.error("No response")
        return {
            success: false,
            error: 'No response'
        };
    }
    if (isError(res)) {
        console.error(res.error)
        if (param.errorMsg) {
            toast.error(param.errorMsg)
        } else {
            toast.error(`Error: ${res.error}`)
        }
    } else {
        if (param.successMsg) {
            toast.success(param.successMsg)
        } else {
            toast.success("Success")
        }
    }
    return res;

}

export function useMasca() {
    return useContext(MascaContext);
}

export {
    connectMasca,
    callWrapper,
}