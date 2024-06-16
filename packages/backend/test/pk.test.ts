import assert from 'node:assert';
import {PkDb} from '../src/db/pk';
import {initDb} from '../src';


describe('PK DB test', () => {
    let pkDb: PkDb;

    beforeAll(async () => {
        await initDb();
        pkDb = new PkDb();
        await pkDb.drop();
    });

    it('get fail', async () => {
        const result = await pkDb.get('user');
        assert.equal(result, null);
    });
});