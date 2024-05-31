import {createContext, ReactNode, useEffect, useRef, useState} from "react";
import {useAccount} from "wagmi";
import {MascaApi} from "@blockchain-lab-um/masca-connector";
import toast from "../toast.ts";
import {connectMasca} from "./utility.ts";

interface Param {
    children: ReactNode
}

export interface Masca {
    api: MascaApi | null
}

export const MascaContext = createContext<Masca>({
    api: null
})

function MascaProvider(param: Param) {
    const [mascaApi, setMascaApi] = useState<MascaApi | null>(null);
    const isConnecting = useRef(false);
    const account = useAccount();
    const {isConnected, address} = account;

    useEffect(() => {
        setTimeout(async () => {
            try {
                if (!isConnecting.current && isConnected && account.address) {
                    console.log("Reconnect to masca")
                    isConnecting.current = true;
                    setMascaApi(await connectMasca(account.address))
                    isConnecting.current = false;
                    toast.success('Connected to Masca')
                }
            } catch (e) {
                console.log(e);
                isConnecting.current = false;
                toast.error('Failed to connect Masca')
            }
        })
    }, [isConnected, address]);

    return (
        <MascaContext.Provider value={{api: mascaApi}}>
            {param.children}
        </MascaContext.Provider>
    );
}

export default MascaProvider;