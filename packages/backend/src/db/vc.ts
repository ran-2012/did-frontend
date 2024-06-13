import {GetVcResponse, VcRequest, VcRequestStatus, WithStatus} from '@did-demo/common';
import {getModelForClass, index, prop} from '@typegoose/typegoose';
import mongoose from 'mongoose';

@index({holder: 1, issuer: 1})
export class VcRequestData implements GetVcResponse {

    @prop()
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

    constructor(holder: string, issuer: string, issuerPublicKey: string, publicKey: string, signedVc: string, vc: string, status: VcRequestStatus) {
        this.holder = holder;
        this.issuer = issuer;
        this.issuerPublicKey = issuerPublicKey;
        this.publicKey = publicKey;
        this.signedVc = signedVc;
        this.vc = vc;
        this.status = status;
    }
}

const VcModel = getModelForClass(VcRequestData);

export class VcDb {

    async getByHolder(holder: string) {
        return VcModel.find({holder}).exec();
    }

    async getByIssuer(issuer: string) {
        return VcModel.find({issuer}).exec();
    }

    async get(id: string) {
        return VcModel.findById(id).exec();
    }

    async create(data: VcRequest & WithStatus) {
        const vc = await VcModel.create(data);
        await vc.save();
    }

    async update(id: string, data: Partial<VcRequestData>) {
        await VcModel.findByIdAndUpdate(id, data).exec();
    }

    async delete(id: string) {
        await VcModel.findByIdAndDelete(id).exec();
    }
}
