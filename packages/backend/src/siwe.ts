import {Router} from 'express';
import {generateNonce, SiweMessage} from 'siwe';

const siweRouter = Router();

siweRouter.get('/login/nonce', async (req, res) => {
    const nonce = generateNonce();
    res.status(200).json({nonce});
});

siweRouter.post('/login/verify', async (req, res) => {
    const {msg, sign} = req.body;
    const siweMsg = new SiweMessage(msg);
    try {
        const isValid = await siweMsg.verify(sign);
        res.status(200).json({isValid});
    } catch (e) {
        if (e instanceof Error) {
            res.status(400).json({error: e.message});
        } else {
            res.status(400).json({error: 'Unknown error'});
        }
    }

});

export {
    siweRouter
};