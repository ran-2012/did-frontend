import {Handler, Router} from 'express';
import {VcRequest, VcRequestStatus} from '@did-demo/common';
import {checkSiwe} from './siwe';
import {VcDb} from './db/vc';

const vcRouter: Router = Router();

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

vcRouter.post('/vc', async (req, res) => {
    const {holder, issuer, issuerPublicKey, publicKey, signedVc, vc} = req.body as VcRequest;
    if (!holder || !issuer || !issuerPublicKey || !publicKey || !signedVc || !vc) {
        res.status(400).send({error: 'Missing required fields'});
        return;
    }

    await vcDb.create({holder, issuer, issuerPublicKey, publicKey, signedVc, vc, status: VcRequestStatus.PENDING});
    res.status(200).send();
});

vcRouter.get('/vc/sent', async (req, res) => {
    const data = await vcDb.getByHolder(req.user!);
    res.status(200).send({data});
});

vcRouter.get('/vc/received', async (req, res) => {
    const data = await vcDb.getByIssuer(req.user!);
    res.status(200).send({data});
});

vcRouter.delete('/vc/:id', getVcData, async (req, res) => {
    if (req.vcData!.holder != req.user) {
        res.status(403).send({error: 'Unauthorized, only holder can delete VC'});
        return;
    }

    await vcDb.delete(req.params.id);
    res.status(200).send();
});

vcRouter.put('/vc/:id/', getVcData, async (req, res) => {
    const {issuer, signedVc} = req.body as Partial<VcRequest>;
    if (!issuer) {
        res.status(400).send({error: 'Missing issuer'});
        return;
    }
    if (!signedVc) {
        res.status(400).send({error: 'Missing signed VC'});
        return;
    }

    if (issuer != req.user) {
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

export {
    vcRouter
};
