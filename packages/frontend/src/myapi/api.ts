import {SiweMessage} from "siwe";

export interface Result<C> {
    data: C;
}

function createSiweMessage(address: string, chainId: string){
    const message = new SiweMessage({

    })
}


export class Api {
    async getNonce(): Promise<string> {
        const res = await fetch('/login/nonce', {
            method: 'GET'
        })
        return (await res.json() as Result<string>).data;
    }

    async login() {

    }
}

export const DefaultApi = new Api();