import * as lz from 'lz-string';

function compressToBase64(data: string | object): string {
    if (typeof data === 'object') data = JSON.stringify(data)
    return lz.compressToBase64(data)
}

export {
    compressToBase64,
}