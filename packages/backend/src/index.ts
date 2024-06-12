import 'dotenv/config';
import express, {Router} from 'express';
import {PublicKey} from '@did-demo/common';
import cors from 'cors';
import {siweRouter} from './siwe';
import {getLogger} from './log';

const log = getLogger('index');
log.i('NODE_ENV', process.env.NODE_ENV);
log.i('Hostname: ', process.env.HOSTNAME);

const app = express();

app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(cors({credentials: true, origin: '*'}));

app.use((req, res, next) => {
    console.log(`Request: ${req.method} ${req.url}`);
    next();
});

app.use(siweRouter);

app.get('/', (req, res) => {
    res.send('Hello World!');
    res.status(200);
});

app.post('/public-key', (req, res) => {
    const pk2 = new PublicKey('did:example:123', 'key');
    const pK = JSON.parse(req.body) as PublicKey;
});

app.listen(3000, () => {
    console.log('Listening on port 3000');
    console.log('Access at http://localhost:3000/');
});

export {
    app
};

