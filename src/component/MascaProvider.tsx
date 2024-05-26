import {ReactNode, useEffect, useRef, useState} from "react";
import {useAccount} from "wagmi";
import {connectMasca} from "../masca/utility.ts";
import {MascaApi} from "@blockchain-lab-um/masca-connector";
import toast from "../toast.ts";

interface Param {
    children: ReactNode
}

function MascaProvider(param: Param) {
    const [_, setMascaApi] = useState<MascaApi | null>(null);
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
        <>{param.children}</>
    );
}

export default MascaProvider;