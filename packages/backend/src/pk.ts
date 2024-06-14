import {Router} from 'express';
import {getLogger} from './log';
import {siweRouter} from './siwe';
import {PkDb} from './db/pk';

const pkRouter = Router();
pkRouter.use(siweRouter);

const log = getLogger('PkDb');

const pkDb = new PkDb();

pkRouter.get('/pk/user/:user', async (req, res) => {
    if (req.user != req.params.user) {
        res.status(403).send({error: 'Unauthorized, invalid user'});
        return;
    }
    const result = await pkDb.get(req.params.user);
    res.status(200).send({data: 'pk'});
});

pkRouter.post('/pk', async (req, res) => {
    const {user, pk} = req.body;
    if (!user || !pk) {
        res.status(400).send({error: 'Missing required fields'});
        return;
    }
    if (user != req.user) {
        res.status(403).send({error: 'Unauthorized, invalid user'});
        return;
    }

    await pkDb.create({user, pk});
    log.i('Data created');
    res.status(200).send();
});

export {
    pkRouter
};