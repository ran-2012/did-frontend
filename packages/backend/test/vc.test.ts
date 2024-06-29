import assert from 'node:assert';
import supertest, {Agent} from 'supertest';
import mongoose from 'mongoose';
import {app, initDb} from '../src';
import {VcDb, VcRequestData} from '../src/db/vc';


const token1 = '{"message":"localhost:3080 wants you to sign in with your Ethereum account:\\n0x0FDf03D766559816E67B29Df9DE663aE1A6E6101\\n\\nLogin in to use credential transfer\\n\\nURI: http://localhost:3080/test\\nVersion: 1\\nChain ID: 11155111\\nNonce: taXH5Is1rZQXIA0ge\\nIssued At: 2024-06-13T12:15:24.601Z","signature":"0x9ef5e4f44049c9f8d680b02ff1c81dc3f8f015f3c5a985abcf4f9992d86e98de3890c89f701a46a0670d2e229df9a3cea20941983d911b2123a1dbe43a56f5cb1c"}';
const token2 = '{"message":"localhost:3080 wants you to sign in with your Ethereum account:\\n0x695AA669D528eA37340AB18383411CdAb4e1b10f\\n\\nLogin in to use credential transfer\\n\\nURI: http://localhost:3080/test\\nVersion: 1\\nChain ID: 11155111\\nNonce: 3Q2TK1fFDp8zWrti6\\nIssued At: 2024-06-13T12:36:17.079Z","signature":"0x85420b7e3be3e9b7e639a545c7a0f7584688a1d6401e0f4953edd8eaa635071a45561bee5c7e07575230331ce7e759a0fac4753e8f5bcdff36dde25cbb2544311c"}';

const user1 = '0x0FDf03D766559816E67B29Df9DE663aE1A6E6101';
const user2 = '0x695AA669D528eA37340AB18383411CdAb4e1b10f';

describe('VC API test', () => {
    let agent: Agent;
    let vcDb: VcDb;

    beforeAll(async () => {
        await initDb();
        vcDb = new VcDb();
        agent = supertest.agent(app);
    });

    beforeEach(async () => {
        await vcDb.drop();
    });
    it('Request vc', async () => {
        const data = new VcRequestData(user1, user2);
        // Send VcRequest
        const res = await agent.post('/vc')
            .set('X-SIWE', token1)
            .send(data);
        assert.equal(res.status, 200);
        const list = await vcDb.getByHolder(user1);
        assert.equal(list.length, 1);
    });
    it('Get vc by holder', async () => {
        const data = new VcRequestData(user1, user2);
        await vcDb.create(data);
        const res = await agent.get(`/vc/holder/${user1}`)
            .set('X-SIWE', token1);
        assert.equal(res.status, 200);
        assert.equal(res.body.data.length, 1);

        const res2 = await agent.get(`/vc/holder/${user2}`)
            .set('X-SIWE', token2);
        assert.equal(res2.status, 200);
        assert.equal(res2.body.data.length, 0);
    });

    it('Unauthorized case', async () => {
        const data = new VcRequestData(user1, user2);
        await vcDb.create(data);
        const res = await agent.get(`/vc/holder/${user1}`)
            .set('X-SIWE', token2);
        assert.equal(res.status, 403);
    });

    it('Put signedVc', async () => {
        const _data = new VcRequestData(user1, user2);
        await vcDb.create(_data);
        const data = (await vcDb.getByHolder(user1))[0];
        const res = await agent.put(`/vc/${data.id}`)
            .set('X-SIWE', token2)
            .send({signedVc: 'signed vc'});
        assert.equal(res.status, 200);
        const vcData = await vcDb.get(data.id);
        assert.equal(vcData!.signedVc, 'signed vc');

    });

    it('Delete vc', async () => {
        const data = new VcRequestData(user1, user2);
        await vcDb.create(data);
        const vcData = (await vcDb.getByHolder(user1))[0];
        const res = await agent.delete(`/vc/${vcData.id}`)
            .set('X-SIWE', token1);
        assert.equal(res.status, 200);
        const list = await vcDb.getByHolder(user1);
        assert.equal(list.length, 0);
    });

    it('create with id', async () => {
        const data = new VcRequestData(user1, user2);
        const id = new mongoose.Types.ObjectId();
        console.log('id: ' + id);
        data._id = id;
        await vcDb.create(data);
    });

    afterAll(async () => {
        process.exit(0);
    });
});

