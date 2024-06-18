import {WithId} from "./utility";

export interface VcRequest {
    holder: string,
    issuer: string,
    /**
     * Pk used to encrypt the signed verifiable credential
     */
    publicKey: string,
    /**
     * Pk used to encrypt the unsigned verifiable credential
     */
    issuerPublicKey: string,

    vc: string,
    signedVc: string,
    holderEncryptedVc: string;
}

export enum VcRequestStatus {
    PENDING,
    SIGNED,
    REJECTED,
    UNKNOWN,
}

export interface WithStatus {
    status: VcRequestStatus,
}

export class GetVcResponse implements VcRequest {
    _id: unknown = null;
    get id(): string {
        return this._id?.toString() || 'unknown';
    }

    holder: string = '';
    issuer: string = '';
    issuerPublicKey: string = '';
    publicKey: string = '';
    signedVc: string = '';
    vc: string = '';
    holderEncryptedVc: string = '';
    status: VcRequestStatus = VcRequestStatus.PENDING;

    constructor(source: GetVcResponse) {
        this._id = source._id;
        this.holder = source.holder;
        this.holder = source.holder;
        this.issuer = source.issuer;
        this.issuerPublicKey = source.issuerPublicKey;
        this.publicKey = source.publicKey;
        this.signedVc = source.signedVc;
        this.vc = source.vc;
        this.holderEncryptedVc = source.holderEncryptedVc;
        this.status = source.status;
    }
}

/**
 * Sent out VC requests
 */
export interface GetMyVcRequestResponse {
    data: GetVcResponse[],
}

/**
 * Received VC requests
 */
export interface GetReceivedVcRequestResponse extends GetMyVcRequestResponse {
}