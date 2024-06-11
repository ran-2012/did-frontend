import {jsbn, md, pki, random} from 'node-forge';
import * as lz from 'lz-string';

/**
 * Create a new RSA key pair, with optional seed
 * @param seed
 */
function createKeyPair(seed: string | null = null) {
    const prng = random.createInstance();
    if (seed != null) {
        prng.seedFileSync = () => seed;
    }
    const pair = pki.rsa.generateKeyPair({bits: 3072, prng});
    return {sk: pair.privateKey, pk: pair.publicKey}
}

function encryptMessage(message: string, publicKey: pki.rsa.PublicKey) {
    return publicKey.encrypt(message, 'RSAES-PKCS1-V1_5');
}

function decryptMessage(encrypted: string, privateKey: pki.rsa.PrivateKey) {
    return privateKey.decrypt(encrypted, 'RSAES-PKCS1-V1_5');
}

function exportPublicKey(publicKey: pki.rsa.PublicKey) {
    return lz.compressToBase64(JSON.stringify({n: publicKey.n.toString(16), e: publicKey.e.toString(16)}));
}

/**
 * @Deprecated Maybe we should not export private key
 * @param privateKey
 */
function exportPrivateKey(privateKey: pki.rsa.PrivateKey) {
    return lz.compressToBase64(JSON.stringify({
        n: privateKey.n.toString(16),
        e: privateKey.e.toString(16),
        d: privateKey.d.toString(16),
        p: privateKey.p.toString(16),
        q: privateKey.q.toString(16),
        dP: privateKey.dP.toString(16),
        dQ: privateKey.dQ.toString(16),
        qInv: privateKey.qInv.toString(16)
    }));
}

function importPublicKey(data: string) {
    const json = JSON.parse(lz.decompressFromBase64(data));
    return pki.rsa.setPublicKey(new jsbn.BigInteger(json.n, 16), new jsbn.BigInteger(json.e, 16));
}

export function importPrivateKey(data: string) {
    const pk = JSON.parse(lz.decompressFromBase64(data));
    return pki.rsa.setPrivateKey(
        new jsbn.BigInteger(pk.n, 16),
        new jsbn.BigInteger(pk.e, 16),
        new jsbn.BigInteger(pk.d, 16),
        new jsbn.BigInteger(pk.p, 16),
        new jsbn.BigInteger(pk.q, 16),
        new jsbn.BigInteger(pk.dP, 16),
        new jsbn.BigInteger(pk.dQ, 16),
        new jsbn.BigInteger(pk.qInv, 16)
    );
}

/**
 * Hash of target string
 * @param str
 * @return {string} sha256 hash hex
 */
export function sha256(str: string): string {
    const sha = md.sha256.create();
    sha.update(str);
    return sha.digest().toHex();
}

export {
    createKeyPair,
    encryptMessage,
    decryptMessage,
    exportPublicKey,
    exportPrivateKey,
    importPublicKey,
}
