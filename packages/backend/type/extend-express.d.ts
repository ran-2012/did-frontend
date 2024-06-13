import 'express';
import {VcRequestData} from '../src/db/vc';

declare global {
    namespace Express {
        export interface Request {
            user?: string,
            vcData?: VcRequestData,
        }
    }
}