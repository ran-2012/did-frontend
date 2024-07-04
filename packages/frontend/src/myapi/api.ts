import {createSiweMessage as _createSiweMessage} from "viem/siwe";
import {Address} from "viem";
import {GetVcResponse, VcRequest} from "@did-demo/common";
import {VerifiableCredential} from "@veramo/core";

const API_HOST = import.meta.env.VITE_API_HOST ?? 'http://localhost:3000';

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

async function checkResponse(res: Response) {
    if (res.status == 401 || res.status == 403 || res.status == 400) {
        const message = (await res.json()).error as string | undefined;
        if (message) {
            console.error(message);
            throw new Error((await res.json()).error);
        } else {
            console.error(res.statusText);
            throw new Error(res.statusText);
        }
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
        await checkResponse(res);
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
        await checkResponse(res);
        return (await res.json()).isValid;
    }

    private convertVcResponse(list: GetVcResponse[]) {
        const res: GetVcResponse[] = [];
        for (const vcResponse of list) {
            res.push(new GetVcResponse(vcResponse));
        }
        return res;
    }

    async getMyRequestList(user: string): Promise<GetVcResponse[]> {
        const res = await fetch(API_HOST + '/vc/holder/' + user, {
            headers: {
                ...this.tokenHeader(),
            }
        });

        await checkResponse(res);
        return this.convertVcResponse((await res.json()).data);
    }

    async getReceivedRequestList(user: string): Promise<GetVcResponse[]> {
        const res = await fetch(API_HOST + '/vc/issuer/' + user, {
            headers: {
                ...this.tokenHeader(),
            }
        });

        await checkResponse(res);
        return this.convertVcResponse((await res.json()).data);
    }

    async generateCredentialId() {
        const res = await fetch(API_HOST + '/vc/id', {
            headers: {
                ...this.tokenHeader(),
            }
        });
        await checkResponse(res);
        return (await res.json()).data as string;
    }

    async createRequest(vc: VcRequest) {
        const res = await fetch(API_HOST + '/vc', {
            method: 'POST',
            headers: {
                ...this.tokenHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(vc)
        });

        await checkResponse(res);
        return new GetVcResponse((await res.json()).data);
    }

    async deleteRequest(id: string) {
        const res = await fetch(API_HOST + '/vc/' + id, {
            method: 'DELETE',
            headers: {
                ...this.tokenHeader(),
            }
        });
        await checkResponse(res);
    }

    async rejectRequest(id: string) {
        const res = await fetch(API_HOST + '/vc/' + id + '/reject', {
            method: 'POST',
            headers: {
                ...this.tokenHeader(),
            }
        });
        await checkResponse(res);
    }

    async revokeCredential(id: string) {
        const res = await fetch(API_HOST + '/vc/' + id + '/revoke', {
            method: 'POST',
            headers: {
                ...this.tokenHeader(),
            }
        });
        await checkResponse(res);
    }

    async uploadSignedVc(id: string, signedVc: string) {
        const res = await fetch(API_HOST + '/vc/' + id, {
            method: 'PUT',
            headers: {
                ...this.tokenHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({signedVc})
        });
        await checkResponse(res);
    }


    async uploadPk(user: string, pk: string, vc: VerifiableCredential | null = null) {
        const res = await fetch(API_HOST + '/pk/user/' + user, {
            method: 'POST',
            headers: {
                ...this.tokenHeader(),
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({pk, vc: vc ? JSON.stringify(vc) : undefined})
        });
        await checkResponse(res);
    }

    async getPk(user: string): Promise<string | null> {
        const res = await fetch(API_HOST + '/pk/user/' + user, {
            headers: {
                ...this.tokenHeader(),
            },
        });
        await checkResponse(res);
        return (await res.json()).data;
    }

    getIdForCredential(requestId: string) {
        return `${API_HOST}/vc/${requestId}`;
    }

    constructor(token: string = '') {
        this.token = token;
    }
}