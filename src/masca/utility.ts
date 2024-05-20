import {enableMasca, isError, MascaApi} from '@blockchain-lab-um/masca-connector';
import {Hex} from "viem";


function createCredential() {
    return {
        type: ['VerifiableCredential', 'MascaUserCredential'],
        credentialSubject: {
            id: 'did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101',
            type: 'Regular User',
        },
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

interface Masca {
    api: MascaApi | null
}

const masca: Masca = {
    api: null
}

async function connectMasca(address: Hex) {
    const enableResult = await enableMasca(address, {
        snapId: 'npm:@blockchain-lab-um/masca', // Defaults to `npm:@blockchain-lab-um/masca`
        version: '1.2.2', // Defaults to the latest released version
        supportedMethods: ['did:ethr', 'did:pkh'], // Defaults to all available methods
    });

    console.log("connect result" + enableResult);
    if (isError(enableResult)) {
        console.error(enableResult.error)
        throw new Error(enableResult.error);
    } else {
        masca.api = enableResult.data.getMascaApi();
        return masca.api
    }
}

function useMascaApi() {
    return masca.api;
}

export {
    connectMasca,
    useMascaApi
}