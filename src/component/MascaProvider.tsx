import {toast} from 'react-toastify'
import {Component, ReactNode, useEffect, useState} from "react";
import {useAccount} from "wagmi";
import {connectMasca} from "../masca/utility.ts";
import {MascaApi} from "@blockchain-lab-um/masca-connector";

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
                toast('Connected to Masca')
            } catch (e) {
                console.log(e);
                toast('Failed to connect Masca')
            }
        })
    }, [address]);

    return (
        <>{param.children}</>
    );
}

export default MascaProvider;