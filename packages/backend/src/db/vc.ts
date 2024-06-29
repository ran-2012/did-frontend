import {GetVcResponse, VcRequestStatus} from '@did-demo/common';
import {getModelForClass, index, modelOptions, prop, Severity} from '@typegoose/typegoose';
import mongoose from 'mongoose';

@modelOptions({schemaOptions: {collection: 'vc'}, options: {allowMixed: Severity.ALLOW}})
@index({holder: 1, issuer: 1})
export class VcRequestData implements GetVcResponse {

    _id!: mongoose.Types.ObjectId;

    get id() {
        return this._id.toString();
    }

    @prop()
    holder = '';
    @prop()
    issuer = '';
    @prop()
    issuerPublicKey = '';
    @prop()
    publicKey = '';
    @prop()
    signedVc = '';
    @prop()
    vc = '';
    @prop()
    status = VcRequestStatus.PENDING;
    @prop()
    holderEncryptedVc = '';
    @prop()
    isRevoked = false;

    constructor(holder: string, issuer: string, issuerPublicKey = '', publicKey = '', signedVc = '', vc = '', holderEncryptedVc = '', status: VcRequestStatus = VcRequestStatus.PENDING, isRevoked = false) {
        this.holder = holder;
        this.issuer = issuer;
        this.issuerPublicKey = issuerPublicKey;
        this.publicKey = publicKey;
        this.signedVc = signedVc;
        this.vc = vc;
        this.holderEncryptedVc = holderEncryptedVc;
        this.status = status;
        this.isRevoked = isRevoked;
    }
}

export const VcModel = getModelForClass(VcRequestData);

export class VcDb {

    /**
     * @TestOnly
     */
    async drop() {
        await VcModel.collection.drop();
    }

    async getByHolder(holder: string) {
        return VcModel.find({holder}).exec();
    }

    async getByIssuer(issuer: string) {
        return VcModel.find({issuer}).exec();
    }

    async get(id: string) {
        try {
            return await VcModel.findOne({_id: id}).exec();
        } catch (e) {
            return null;
        }
    }

    async create(data: Omit<VcRequestData, 'id'>): Promise<VcRequestData> {
        const vc = await VcModel.create(data);
        await vc.save();
        return vc;
    }

    async update(id: string, data: Partial<VcRequestData>) {
        await VcModel.findByIdAndUpdate(id, data).exec();
    }

    async delete(id: string) {
        await VcModel.findByIdAndDelete(id).exec();
    }
}
