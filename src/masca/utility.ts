import {enableMasca, isError, MascaApi, Result} from '@blockchain-lab-um/masca-connector';
import {Hex} from "viem";
import toast from "../toast.ts";
import {MascaContext} from "./MascaProvider.tsx";
import {useContext} from "react";

async function connectMasca(address: Hex) {
    const enableResult = await enableMasca(address, {
        snapId: 'npm:@blockchain-lab-um/masca', // Defaults to `npm:@blockchain-lab-um/masca`
        version: '1.2.2', // Defaults to the latest released version
        supportedMethods: ['did:ethr', 'did:pkh'], // Defaults to all available methods
    });

    console.log("connect result" + enableResult);
    if (isError(enableResult)) {
        console.error(enableResult.error)
        throw new Error(enableResult.error);
    } else {
        return enableResult.data.getMascaApi()
    }
}

interface CallWrapperParam {
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
    const res = await promise;
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