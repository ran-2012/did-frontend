import {CredentialSubject, UnsignedCredential, VerifiableCredential} from "@veramo/core";

function convertKvList(list: Array<{ key: string, value: string }>) {
    const map: Map<string, string> = new Map()
    for (const {key, value} of list) {
        if (key === '' || value === '') continue;
        if (map.has(key)) continue
        map.set(key, value)
    }
    return Object.fromEntries(map);
}

function createTestCredential(list: Array<{ key: string, value: string }>) {
    // EXAMPLE:
    // credentialSubject: {
    //     id: 'did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101',
    //     type: 'Regular User',
    //     info: 'This is a test credential'
    // },

    return {
        type: ['VerifiableCredential', 'MascaUserCredential'],
        credentialSubject: convertKvList(list),
        credentialSchema: {
            id: 'https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json',
            type: 'JsonSchemaValidator2018',
        },
        '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/ld-context.json',
        ],
    };
}

function getDid(address: string, method: string = "ethr", chainId: string = "0xaa36a7") {
    return `did:${method}:${chainId}:${address}`
}

function formatAddress(address: string) {
    return `${address.slice(0, 5)}...${address.slice(-4)}`
}

function formatDid(did: string) {
    const seg = did.split(':')
    seg[seg.length - 1] = formatAddress(seg[seg.length - 1])
    return seg.join(':')
}

export function formatDidFromAddress(address: string, method: string = "ethr", chainId: string = "0xaa36a7") {
    return formatDid(getDid(address, method, chainId));
}

export function createVerifiableCredential(vc: Partial<UnsignedCredential> & {
    credentialSubject: CredentialSubject
}): UnsignedCredential {
    return Object.assign({
        issuer: vc.issuer ?? getDid('unknown'),
        '@context': ['https://www.w3.org/2018/credentials/v1'],
        type: vc.type ?? ['VerifiableCredential'],
        issuanceDate: vc.issuanceDate ?? new Date().toISOString(),
        credentialSubject: vc.credentialSubject,
    }, vc);
}

const VcUtility = {
    getIssuer: (vc: VerifiableCredential, format: boolean = false) => {
        if (typeof vc.issuer == 'string') {
            return format ? formatDid(vc.issuer) : vc.issuer
        }
        return format ? formatDid(vc.issuer.id) : vc.issuer.id
    },
    getTypeString: (vc: VerifiableCredential, separator: string = ', ') => {
        if (!vc.type) {
            return 'Unknown Credential'
        }
        if (typeof vc.type === 'string') {
            return vc.type;
        } else {
            return vc.type.join(separator);
        }
    },
    getIsExpired: (vc: VerifiableCredential) => {
        return vc.expirationDate ? new Date(vc.expirationDate) < new Date() : true;
    }
}

export {
    convertKvList,
    createTestCredential,
    getDid,
    formatAddress,
    formatDid,
    VcUtility
}

