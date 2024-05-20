import {WagmiProvider} from "wagmi";
import {QueryClient, QueryClientProvider} from "@tanstack/react-query";
import {ConnectKitProvider} from "connectkit";
import {config} from '../wagmi/config.ts'

const queryClient = new QueryClient();

export const Web3Provider = ({children}) => {
    return (
        <WagmiProvider config={config}>
            <QueryClientProvider client={queryClient}>
                <ConnectKitProvider theme="auto" options={{}} >{children}</ConnectKitProvider>
            </QueryClientProvider>
        </WagmiProvider>
    );
};