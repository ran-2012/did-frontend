import {Router} from 'express';
import {getLogger} from './log';
import {siweRouter} from './siwe';
import {PkDb} from './db/pk';

const pkRouter = Router();
pkRouter.use(siweRouter);

const log = getLogger('PkDb');

const pkDb = new PkDb();

pkRouter.get('/pk/user/:user', async (req, res) => {
    if (req.user?.toLowerCase() != req.params.user.toLowerCase()) {
        res.status(403).send({error: 'Unauthorized, invalid user'});
        return;
    }
    const user = req.params.user.toLowerCase();
    const result = await pkDb.get(user);
    if (!result) {
        res.status(404).send({error: 'Not found'});
        return;
    }
    res.status(200).send({data: 'pk'});
});

pkRouter.post('/pk/user/:user', async (req, res) => {
    const user = req.params.user.toLowerCase();
    const {pk} = req.body as { pk: string };
    log.i('Create data', {user, pk});
    if (!user || !pk) {
        res.status(400).send({error: 'Missing required fields'});
        return;
    }
    if (user != req.user?.toLowerCase()) {
        res.status(403).send({error: 'Unauthorized, invalid user'});
        return;
    }

    const data = await pkDb.get(user);
    if (data) {
        await pkDb.update(user, pk);
    } else {
        await pkDb.create({user, pk});
    }
    log.i('Data created');
    res.status(200).send();
});

export {
    pkRouter
};