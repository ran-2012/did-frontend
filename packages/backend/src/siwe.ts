import {Handler, Router,} from 'express';
import {generateNonce, SiweMessage} from 'siwe';
import {SiweRequest} from '@did-demo/common';
import {getLogger} from './log';

const siweRouter = Router();

export const SIWE_HEADER_NAME = 'X-SIWE';

const log = getLogger('siwe');

async function checkSiweRequest(siweRequest: SiweRequest) {
    const {message, signature} = siweRequest;
    const siweMessage = new SiweMessage(message);

    if (process.env.NODE_ENV == 'production') {
        if (siweMessage.domain != process.env.HOST) {
            throw new Error(`Invalid domain: ${siweMessage.domain}, required: ${process.env.HOST}`);
        }
    }
    return await siweMessage.verify({signature});
}

export const checkSiwe: Handler = async (req, res, next) => {

    if (!req.headers[SIWE_HEADER_NAME]) {
        res.status(400).json({error: `Missing ${SIWE_HEADER_NAME} header`});
        return;
    }
    const siweHeader = req.headers[SIWE_HEADER_NAME];
    const siweStr = typeof siweHeader === 'string' ? siweHeader : siweHeader[0];
    const siweRequest = JSON.parse(siweStr) as SiweRequest;

    const {message, signature} = siweRequest;
    if (!message || !signature) {
        res.status(400).json({error: 'Missing msg or sign'});
        return;
    }
    try {
        await checkSiweRequest(siweRequest);
    } catch (e) {
        if (e instanceof Error) {
            res.status(400).json({error: e.message});
        }
        return;
    }

    const siweMessage = new SiweMessage(message);
    req.user = siweMessage.address;

    next();
};

siweRouter.get('/login/nonce', async (req, res) => {
    const nonce = generateNonce();
    res.status(200).json({nonce});
});

siweRouter.post('/login/verify', async (req, res) => {
    const siweRequest = req.body as SiweRequest;

    try {
        const response = await checkSiweRequest(siweRequest);
        if (!response.success) {
            res.status(400).json({isValid: false, error: response.error});
            return;
        }
        res.status(200).json({isValid: true});
    } catch (e) {
        if (e instanceof Error) {
            res.status(400).json({isValid: false, error: e.message});
        } else {
            res.status(400).json({isValid: false, error: 'Unknown error'});
        }
    }

});

export {
    siweRouter
};