import {createSiweMessage as _createSiweMessage} from "viem/siwe";
import {Address} from "viem";

const API_HOST = 'http://localhost:3000'

export function createSiweMessage(address: Address, chainId: number, nonce: string,) {
    return _createSiweMessage({
        domain: location.host,
        address: address as Address,
        chainId,
        statement: 'Login in to use credential transfer',
        uri: window.location.href,
        nonce,
        version: '1',
    })
}

function checkResponse(res: Response) {
    if (!res.ok) {
        throw new Error(`Response not ok: ${res.status}`);
    }
}

export class Api {
    async getNonce(): Promise<string> {
        const res = await fetch(API_HOST + '/login/nonce', {
            method: 'GET'
        })
        console.log(res);
        checkResponse(res);
        return (await res.json()).nonce;
    }

    async login() {

    }
}

export const DefaultApi = new Api();