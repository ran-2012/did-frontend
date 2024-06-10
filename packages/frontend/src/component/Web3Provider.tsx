import {WagmiProvider} from "wagmi";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ConnectKitProvider} from "connectkit";
import {ReactNode} from "react";
import {config} from '../wagmi/config.ts'
import MascaProvider from "../masca/MascaProvider.tsx";
import VeramoProvider from "../veramo/VeramoProvider.tsx";

const queryClient = new QueryClient();

interface Param {
    children: ReactNode
}

export const Web3Provider = (param: Param) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider theme="auto" options={{}}>
                    <VeramoProvider>
                        <MascaProvider>{param.children}</MascaProvider>
                    </VeramoProvider>
                </ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};