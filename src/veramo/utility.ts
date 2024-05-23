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

function getDid(method: string, address: string) {
    return `did:${method}:${address}`
}

function formatAddress(address: string) {
    return `${address.slice(0, 5)}...${address.slice(-4)}`
}

function formatDid(did: string){
    const seg = did.split(':')
    seg[seg.length - 1] = formatAddress(seg[seg.length - 1])
    return seg.join(':')
}

export {
    convertKvList,
    createTestCredential,
    getDid,
    formatAddress,
    formatDid
}

