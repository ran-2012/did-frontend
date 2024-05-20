import {enableMasca, isError, isSuccess} from '@blockchain-lab-um/masca-connector';
import {Hex} from "viem";

function convertKvList(list: Array<{ key: string, value: string }>) {
    const map: Map<string, string> = new Map()
    for (const {key, value} of list) {
        if (key === '' || value === '') continue;
        if (map.has(key)) continue
        map.set(key, value)
    }
    return Object.fromEntries(map);
}

function createTestCredential() {
    const obj = {
        type: ['VerifiableCredential', 'MascaUserCredential'],
        credentialSubject: {
            id: 'did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101',
            type: 'Regular User',
            info: 'This is a test credential'
        },
        credentialSchema: {
            id: 'https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json',
            type: 'JsonSchemaValidator2018',
        },
        '@context': [
            'https://www.w3.org/2018/credentials/v1',
            'https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/ld-context.json',
        ],
    }
    return obj;
}

export {
    convertKvList,
    createTestCredential,
}

