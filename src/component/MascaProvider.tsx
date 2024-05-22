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
    const account = useAccount();
    const {isConnected, address} = account;

    useEffect(() => {
        setTimeout(async () => {
            console.log("Reconnect to masca")
            try {
                if (isConnected && account.address) {
                    setMascaApi(await connectMasca(account.address))
                }
                toast.success('Connected to Masca')
            } catch (e) {
                console.log(e);
                toast.error('Failed to connect Masca')
            }
        })
    }, [isConnected, address]);

    return (
        <>{param.children}</>
    );
}

export default MascaProvider;