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

export type GetVcResponse = VcRequest & WithId & WithStatus;

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