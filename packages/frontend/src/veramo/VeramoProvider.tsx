import {createContext, ReactNode, useContext, useEffect, useState} from "react";
import {JsonRpcProvider} from "ethers";
import {VerificationService} from "./Verification.service.ts";

interface Param {
    children: ReactNode
}

export interface Veramo {
    initialized: boolean;
    verify: typeof VerificationService.verify
}

export const VeramoContext = createContext<Veramo>({
    initialized: false,
    verify: VerificationService.verify,
})

function VeramoProvider(param: Param) {
    const [initialized, setInitialized] = useState<boolean>(false);

    useEffect(() => {
        VerificationService.init({
            providers: {
                sepolia: new JsonRpcProvider(
                    `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_ID}`
                )
            }
        }).then(() => {
            console.log("VerificationService initialized")
            setInitialized(true);
        })
    });

    return (
        <VeramoContext.Provider value={{initialized: initialized, verify: VerificationService.verify}}>
            {param.children}
        </VeramoContext.Provider>
    );
}

export function useVeramo() {
    return useContext(VeramoContext);
}

export default VeramoProvider;