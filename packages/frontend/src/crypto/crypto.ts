import {pki} from 'node-forge';
import {Crypto} from '@did-demo/common'
import {LocalStorage} from "../utility/storage.ts";

/**
 * Create a new RSA key pair, with optional seed
 * If seed is not provided, a default random seed will be generated
 * @param seed
 * @param save
 * @return {Promise<{sk: pki.rsa.PrivateKey, pk: pki.rsa.PublicKey}>}
 */
export async function createKeyPair(seed: string | null = null, save: boolean = true): Promise<{
    sk: pki.rsa.PrivateKey;
    pk: pki.rsa.PublicKey;
}> {
    let realSeed = '';
    if (seed == null) {
        realSeed = `__DEFAULT_KEY_SEED__${new Date().getTime()}__${Math.random()}`
        saveDefaultSeed(realSeed)
    } else {
        realSeed = seed;
    }
    const pair = Crypto.createKeyPair(seed);
    if (save) {
        savePublicKey(realSeed, pair.pk);
        savePrivateKey(realSeed, pair.sk);
    }
    return pair;
}

export function hasKeyPair(seed: string | null = null) {
    if (seed == null) {
        seed = loadDefaultSeed();
    }
    if (seed == null) {
        return false;
    }
    return loadPublicKey(seed) != null && loadPrivateKey(seed) != null;
}

function saveDefaultSeed(seed: string) {
    LocalStorage.save('keyPairSeed', seed);
}

export function loadDefaultSeed(): string | null {
    return LocalStorage.load('keyPairSeed') as string;
}

export function savePublicKey(seed: string, pk: pki.rsa.PublicKey | string) {
    if (typeof pk === 'string') {
        LocalStorage.save(`publicKey:${Crypto.sha256(seed)}`, pk);
        return;
    }
    const str = Crypto.exportPublicKey(pk);
    LocalStorage.save(`publicKey:${Crypto.sha256(seed)}`, str);
}

export function savePrivateKey(seed: string, sk: pki.rsa.PrivateKey | string) {
    if (typeof sk === 'string') {
        LocalStorage.save(`privateKey:${Crypto.sha256(seed)}`, sk);
        return;
    }
    const str = Crypto.exportPrivateKey(sk);
    LocalStorage.save(`privateKey:${Crypto.sha256(seed)}`, str);
}

export function getPkHash() {
    const seed = loadDefaultSeed();
    if (seed == null) {
        throw new Error('No seed provided')
    }
    return Crypto.sha256(seed);
}

function loadPublicKey(seed: string | null = null): pki.rsa.PublicKey | null {
    if (seed == null) {
        seed = loadDefaultSeed();
    }
    if (seed == null) {
        throw new Error('No seed provided')
    }
    const str = LocalStorage.load(`publicKey:${Crypto.sha256(seed)}`) as string;
    if (str == null) {
        return null;
    } else {
        return Crypto.importPublicKey(str);
    }
}

function loadPrivateKey(seed: string | null = null): pki.rsa.PrivateKey | null {
    if (seed == null) {
        seed = loadDefaultSeed();
    }
    if (seed == null) {
        throw new Error('No seed provided')
    }
    const str = LocalStorage.load(`privateKey:${Crypto.sha256(seed)}`) as string;
    if (str == null) {
        return null;
    } else {
        return Crypto.importPrivateKey(str);
    }
}

export function encrypt(message: string, publicKey: pki.rsa.PublicKey | null = null) {
    if (publicKey == null) {
        publicKey = loadPublicKey();
    }
    if (publicKey == null) {
        throw new Error('No public key found')
    }
    return Crypto.encryptMessage(message, publicKey);
}

export function decrypt(encrypted: string, privateKey: pki.rsa.PrivateKey | null = null) {
    if (privateKey == null) {
        privateKey = loadPrivateKey();
    }
    if (privateKey == null) {
        throw new Error('No private key found')
    }
    return Crypto.decryptMessage(encrypted, privateKey);
}

export function exportPk(seed: string | null = null) {
    if (seed == null) {
        seed = loadDefaultSeed();
    }
    if (seed == null) {
        return null;
    }
    return LocalStorage.load(`publicKey:${Crypto.sha256(seed)}`) as string;
}