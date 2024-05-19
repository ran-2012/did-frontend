import {http, createConfig} from 'wagmi'
import {sepolia} from 'wagmi/chains'
import {getDefaultConfig} from "connectkit";

const INFURA_ID = import.meta.env.INFURA_ID;

// We will use test chain only (currently).
export const config = createConfig(getDefaultConfig({
    chains: [sepolia],
    transports: {
        [sepolia.id]: http(`https://mainnet.infura.io/v3/${INFURA_ID}`),
    },
    walletConnectProjectId: import.meta.env.WALLET_PROJECT_ID,

    appName: "Local Test APP",
}))