import {createSiweMessage as _createSiweMessage} from "viem/siwe";
import {Address} from "viem";
import {GetVcResponse} from "@did-demo/common";
import {VerifiableCredential} from "@veramo/core";
import {VC} from "../masca/utility.ts";

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
    if (res.status == 401 || res.status == 403 || res.status == 400) {
        throw new Error(`Response not ok: ${res.status}`);
    }
}

export class Api {
    private token = '';

    setToken(token: string) {
        this.token = token;
    }

    private tokenHeader() {
        return {
            'X-SIWE': this.token,
        }
    }

    async getNonce(): Promise<string> {
        const res = await fetch(API_HOST + '/login/nonce', {
            method: 'GET'
        })
        console.log(res);
        checkResponse(res);
        return (await res.json()).nonce;
    }

    async verify(siweMessage: string, signature: string) {
        const res = await fetch(API_HOST + '/login/verify', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                message: siweMessage,
                signature
            })
        })
        console.log(res);
        checkResponse(res);
        return (await res.json()).isValid;
    }

    async getMyRequestList(user: string): Promise<GetVcResponse[]> {
        const res = await fetch(API_HOST + '/vc/holder/' + user, {
            headers: {
                ...this.tokenHeader(),
            }
        });

        checkResponse(res);
        return (await res.json()).data;
    }

    async getReceivedRequestList(user: string): Promise<GetVcResponse[]> {
        const res = await fetch(API_HOST + '/vc/issuer/' + user, {
            headers: {
                ...this.tokenHeader(),
            }
        });

        checkResponse(res);
        return (await res.json()).data;
    }

    async deleteRequest(id: string) {
        const res = await fetch(API_HOST + '/vc/' + id, {
            method: 'DELETE',
            headers: {
                ...this.tokenHeader(),
            }
        });
        checkResponse(res);
    }

    async rejectRequest(id: string) {
        const res = await fetch(API_HOST + '/vc/' + id + '/reject', {
            method: 'POST',
            headers: {
                ...this.tokenHeader(),
            }
        });
        checkResponse(res);
    }

    async uploadSignedVc(id: string, signedVc: VerifiableCredential) {
        const res = await fetch(API_HOST + '/vc/' + id, {
            method: 'PUT',
            headers: {
                ...this.tokenHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({signedVc})
        });
        checkResponse(res);
    }

    async uploadPk(user: string, pk: string) {
        const res = await fetch(API_HOST + '/pk/user/' + user, {
            method: 'POST',
            headers: {
                ...this.tokenHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({pk, test: '12312312'})
        });
        checkResponse(res);
    }

    async getPk(user: string): Promise<string | null> {
        const res = await fetch(API_HOST + '/pk/user/' + user, {
            headers: {
                ...this.tokenHeader(),
            },
        });
        checkResponse(res);
        return (await res.json()).data;
    }

    constructor(token: string = '') {
        this.token = token;
    }
}