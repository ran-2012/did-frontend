import {cipher, jsbn, md, pki, random, util} from 'node-forge';
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
    // AES-256
    const key = random.getBytesSync(32);
    const iv = random.getBytesSync(32);
    const c = cipher.createCipher('AES-CBC', key);

    c.start({iv});
    c.update(util.createBuffer(message));
    c.finish;

    const encrypted = util.encode64(c.output.getBytes());
    const encryptedKey = util.encode64(publicKey.encrypt(key, 'RSAES-PKCS1-V1_5'));
    const encryptedIv = util.encode64(publicKey.encrypt(iv, 'RSAES-PKCS1-V1_5'));

    const result = {
        encryptedMessage: encrypted,
        encryptedKey: encryptedKey,
        encryptedIv: encryptedIv
    }

    return lz.compressToBase64(JSON.stringify(result));
}

function decryptMessage(encrypted: string, privateKey: pki.rsa.PrivateKey) {
    const json = JSON.parse(lz.decompressFromBase64(encrypted));

    const {encryptedMessage, encryptedKey, encryptedIv} = json;
    const key = privateKey.decrypt(util.decode64(encryptedKey), 'RSAES-PKCS1-V1_5');
    const iv = privateKey.decrypt(util.decode64(encryptedIv), 'RSAES-PKCS1-V1_5');
    const c = cipher.createDecipher('AES-CBC', key);

    c.start({iv});
    c.update(util.createBuffer(util.decode64(encryptedMessage)));
    c.finish();

    return c.output.toString();
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
