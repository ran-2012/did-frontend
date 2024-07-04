import {getModelForClass, index, modelOptions, prop, Severity} from '@typegoose/typegoose';

@modelOptions({schemaOptions: {collection: 'pk'}, options: {allowMixed: Severity.ALLOW}})
@index({user: 1})
export class PkData {

    @prop()
    user = '';

    @prop()
    pk = '';

    @prop()
    vc = '';

    constructor(user: string, pk: string, vc: string) {
        this.user = user;
        this.pk = pk;
        this.vc = vc ?? '';
    }
}

export const PkModel = getModelForClass(PkData);

export class PkDb {

    /**
     * @TestOnly
     */
    async drop() {
        await PkModel.collection.drop();
    }

    async create(data: PkData) {
        const pkData = await PkModel.create(data);
        await pkData.save();
    }

    async get(user: string): Promise<{ pk: string, vc: string } | null> {
        const res = await PkModel.findOne({user}).exec();
        if (res) {
            return {pk: res.pk, vc: res.vc};
        } else {
            return null;
        }
    }

    async update(user: string, pk: string, vc: string) {
        await PkModel.findOneAndUpdate({user: user}, {pk, vc});
    }
}
