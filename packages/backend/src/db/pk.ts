import {getModelForClass, index, prop} from '@typegoose/typegoose';

@index({user: 1})
export class PkData {

    @prop()
    user = '';

    @prop()
    pk = '';

    constructor(user: string, pk: string) {
        this.user = user;
        this.pk = pk;
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

    async get(user: string) {
        return PkModel.findOne({user}).exec();
    }

    async update(user: string, pk: string) {
        await PkModel.findOneAndUpdate({user}, {pk});
    }
}
