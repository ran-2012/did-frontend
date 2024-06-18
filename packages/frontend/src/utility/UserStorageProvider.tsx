import {Component, createContext, ReactNode, useContext, useEffect} from "react";
import {useAccount} from "wagmi";
import {LocalStorage} from "./storage.ts";

interface Param {
    children: ReactNode
}

const UserStorageContext = createContext({storage: LocalStorage})


/**
 * Do nothing currently
 * @param param
 * @constructor
 * @Deprecated
 */
function UserStorageProvider(param: Param) {
    const account = useAccount()

    useEffect(() => {
        // LocalStorage.setPrefix(account.address ?? '')
    }, [account.address]);

    return (
        <UserStorageContext.Provider value={
            {storage: LocalStorage}
        }>
            {param.children}
        </UserStorageContext.Provider>
    );
}

export function useStorage() {
    return useContext(UserStorageContext);
}

export default UserStorageProvider;