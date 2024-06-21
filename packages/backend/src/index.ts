import 'dotenv/config';
import express, {ErrorRequestHandler} from 'express';
import cors from 'cors';
import mongoose from 'mongoose';
import {siweRouter} from './siwe';
import {getLogger} from './log';
import config from './config';
import {vcRouter} from './vc';
import {pkRouter} from './pk';

const log = getLogger('Server');
log.i('NODE_ENV', process.env.NODE_ENV);
log.i('Hostname: ', process.env.HOSTNAME);

const app = express();

const errorHandler: ErrorRequestHandler = (err, _, res, __) => {
    const error = err as Error;
    log.e(error.stack);
    log.e(err);
    res.status(500).send({error: 'Something broke!', detail: err});
};

app.use((req, res, next) => {
    log.d(`Request: ${req.method} ${req.url}`);
    next();
});

app.use(express.urlencoded({extended: true}));
app.use(express.json());
app.use(cors({
    credentials: true,
    origin: '*',
    // origin: ['http://localhost:3080'],
    // allowedHeaders: ['Content-Type']
}));

app.use('/', siweRouter);
app.use('/', vcRouter);
app.use('/', pkRouter);

app.use(errorHandler);

async function startServer() {
    await new Promise<void>((resolve) => {
        app.listen(config.port, () => {
            log.i(`Listening on port ${config.port}`);
            log.d(`Access at http://localhost:${config.port}/`);
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

// process.on('SIGKILL', async () => {
//     await mongoose.disconnect();
// });

main().then(() => {
    log.d('Started');
}).catch((e)=>{
    log.e(e);
});

export {
    app,
    initDb,
    startServer

};

