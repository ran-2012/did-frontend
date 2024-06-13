import 'dotenv/config';
import express, {ErrorRequestHandler, Router} from 'express';
import {PublicKey} from '@did-demo/common';
import cors from 'cors';
import mongoose from 'mongoose';
import {siweRouter} from './siwe';
import {getLogger} from './log';
import config from './config';
import {vcRouter} from './vc';

const log = getLogger('Server');
log.i('NODE_ENV', process.env.NODE_ENV);
log.i('Hostname: ', process.env.HOSTNAME);

const app = express();


const errorHandler: ErrorRequestHandler = (err, _, res, __) => {
    log.e(err);
    res.status(500).send({error: 'Something broke!', detail: err});
};
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({credentials: true, origin: '*'}));

app.use((req, res, next) => {
    log.d(`Request: ${req.method} ${req.url}`);
    next();
});

app.use(siweRouter);
app.use(vcRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
    res.status(200);
});

app.post('/public-key', (req, res) => {
    const pk2 = new PublicKey('did:example:123', 'key');
    const pK = JSON.parse(req.body) as PublicKey;
});

app.use(errorHandler);

async function startServer() {
    await new Promise<void>((resolve) => {
        app.listen(config.port, () => {
            log.i(`Listening on port ${config.port}`);
            log.d('Access at http://localhost:3000/');
            resolve();
        });
    });
}

async function initDb() {
    await mongoose.connect(config.mongodb.connectStr);
}

async function main() {
    await initDb();
    await startServer();
}

process.on('SIGKILL', async () => {
    await mongoose.disconnect();
});

main().then(() => {
    log.d('Started');
});

export {
    app,
    initDb,
    startServer

};

