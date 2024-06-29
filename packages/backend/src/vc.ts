import {Handler, Router} from 'express';
import {VcRequest, VcRequestStatus} from '@did-demo/common';
import {ObjectId} from 'mongodb';
import {checkSiwe} from './siwe';
import {VcDb} from './db/vc';
import {getLogger} from './log';

const vcRouter: Router = Router();
const log = getLogger('VcRouter');

vcRouter.use(checkSiwe);

const getVcData: Handler = async (req, res, next) => {
    const vcData = await vcDb.get(req.params.id);
    if (!vcData) {
        res.status(404).send({error: 'VC not found'});
        return;
    }
    req.vcData = vcData;
    next();

};

const vcDb = new VcDb();

vcRouter.get('/vc/id', async (req, res) => {
    // return newly generated valid object id

    const id = new ObjectId();
    res.status(200).send({data: id});
});

vcRouter.post('/vc', async (req, res) => {
    const {id, holder, issuer, issuerPublicKey, publicKey, signedVc, vc, holderEncryptedVc} = req.body as VcRequest;
    if (!holder || !issuer) {
        res.status(400).send({error: 'Missing required fields'});
        return;
    }

    if (!ObjectId.isValid(id)) {
        res.status(400).send({error: 'Invalid id'});
    }

    const oId = ObjectId.createFromHexString(id);
    const data = await vcDb.create({
        _id: oId,
        holder: holder.toLowerCase(),
        issuer: issuer.toLowerCase(),
        issuerPublicKey,
        publicKey,
        signedVc,
        vc,
        holderEncryptedVc,
        status: VcRequestStatus.PENDING,
        isRevoked: false
    });
    //log
    log.i('Data created');
    res.status(200).send({data});
});

vcRouter.get('/vc/holder/:holder', async (req, res) => {
    if (req.user?.toLowerCase() != req.params.holder.toLowerCase()) {
        res.status(403).send({error: 'Unauthorized, invalid holder'});
        return;
    }
    const user = req.params.holder.toLowerCase();
    const data = await vcDb.getByHolder(user);
    res.status(200).send({data});
});

vcRouter.get('/vc/issuer/:issuer', async (req, res) => {
    if (req.user != req.params.issuer) {
        res.status(403).send({error: 'Unauthorized, invalid issuer'});
        return;
    }
    const user = req.params.issuer.toLowerCase();
    const data = await vcDb.getByIssuer(user);
    res.status(200).send({data});
});

vcRouter.delete('/vc/:id', getVcData, async (req, res) => {
    if (req.vcData!.holder.toLowerCase() != req.user?.toLowerCase()) {
        res.status(403).send({error: 'Unauthorized, only holder can delete VC'});
        return;
    }

    await vcDb.delete(req.params.id);
    res.status(200).send();
});

vcRouter.put('/vc/:id/', getVcData, async (req, res) => {
    const issuer = req.vcData!.issuer.toLowerCase();
    const {signedVc} = req.body as Partial<VcRequest>;
    if (!issuer) {
        res.status(400).send({error: 'Missing issuer'});
        return;
    }
    if (!signedVc) {
        res.status(400).send({error: 'Missing signed VC'});
        return;
    }

    if (issuer != req.user?.toLowerCase()) {
        res.status(403).send({error: 'Unauthorized'});
        return;
    }

    await vcDb.update(req.params.id, {signedVc, status: VcRequestStatus.SIGNED});
    res.status(200).send();
});

vcRouter.post('/vc/:id/reject', getVcData, async (req, res) => {
    if (req.vcData!.issuer != req.user) {
        res.status(403).send({error: 'Unauthorized, only issuer can reject VC'});
    }
    await vcDb.update(req.params.id, {status: VcRequestStatus.REJECTED});
    res.status(200).send();
});

vcRouter.post('/vc/:id/revoke', getVcData, async (req, res) => {
    if (req.vcData!.issuer != req.user) {
        res.status(403).send({error: 'Unauthorized, only issuer can revoke VC'});
    }
    await vcDb.update(req.params.id, {isRevoked: true});
});

export {
    vcRouter
};
