import {VerifiableCredential} from "@veramo/core";

interface PublicKeyCredentialSubject {
    id: string;
    type: 'rsa';
    publicKey: string;
}

interface PublicKeyCredential extends VerifiableCredential {
    credentialSubject: PublicKeyCredentialSubject;
}

class PublicKey {
    type: "rsa";
    ownerDid: string;
    key: string;
    signature: string = '';

    constructor(ownerDid: string, key: string, signature: string = '') {
        this.type = "rsa";
        this.ownerDid = ownerDid;
        this.key = key;
        this.signature = signature;
    }

    setSignature(signature: string) {
        this.signature = signature;
    }

    verify(data: string): boolean {
        // This is a dummy implementation
        return true;
    }
}

class EncryptedData {
    data: string;
    publicKey: PublicKey;
    encryptorDid: string;
    receiverDid: string | null;

    constructor(data: string, publicKey: PublicKey, encryptorDid: string, receiverDid: string | null = null) {
        this.data = data;
        this.publicKey = publicKey;
        this.encryptorDid = encryptorDid;
        this.receiverDid = receiverDid;
    }
}

export {
    PublicKeyCredentialSubject,
    PublicKeyCredential,
    PublicKey,
    EncryptedData
}
