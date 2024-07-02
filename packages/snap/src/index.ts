/* eslint-disable @typescript-eslint/no-throw-literal,@typescript-eslint/await-thenable */
import type {OnRpcRequestHandler} from '@metamask/snaps-sdk';
import {
    DialogType,
    panel,
    text,
    heading,
    copyable,
    InvalidParamsError,
    UserRejectedRequestError,
} from '@metamask/snaps-sdk';
import {
    add0x,
    assert,
    bytesToHex,
    stringToBytes,
    remove0x,
} from '@metamask/utils';
import {sign as signEd25519} from '@noble/ed25519';
import {sign as signSecp256k1} from '@noble/secp256k1';

import {Crypto} from "@did-demo/common";
import {getPrivateNode} from './utils';
import {SignMessageParams} from "./types";

/**
 * Handle incoming JSON-RPC requests, sent through `wallet_invokeSnap`.
 *
 * @param args - The request handler args as object.
 * @param args.origin - The origin of the request, e.g., the website that
 * invoked the snap.
 * @param args.request - A validated JSON-RPC request object.
 * @returns The result of `snap_dialog`.
 * @throws If the request method is not valid for this snap.
 */
export const onRpcRequest: OnRpcRequestHandler = async ({
                                                            origin,
                                                            request,
                                                        }) => {
    switch (request.method) {
        case 'hello':
            // eslint-disable-next-line no-case-declarations
            const node = await getPrivateNode({path: ["m", "44'", "0'"], curve: 'ed25519'});
            assert(node.privateKey);
            // eslint-disable-next-line no-case-declarations
            const keypair = Crypto.createKeyPair(node.privateKey);
            return snap.request({
                method: 'snap_dialog',
                params: {
                    type: 'confirmation',
                    content: panel([
                        text(`PK: ${Crypto.exportPublicKey(keypair.pk)}`),
                        text('This custom confirmation is just for display purposes.'),
                        text(
                            'But you can edit the snap source code to make it do something, if you want to!',
                        ),
                    ]),
                },
            });
        case 'signMessage': {
            const {message, curve, ...params} =
                request.params as SignMessageParams;

            if (!message || typeof message !== 'string') {
                throw new InvalidParamsError(`Invalid signature data: "${message}".`);
            }

            const node = await getPrivateNode({...params, curve});

            assert(node.privateKey);
            assert(
                curve === 'ed25519' ||
                curve === 'ed25519Bip32' ||
                curve === 'secp256k1',
            );

            const approved = await snap.request({
                method: 'snap_dialog',
                params: {
                    type: DialogType.Confirmation,
                    content: panel([
                        heading('Signature request'),
                        text(
                            `Do you want to ${curve} sign "${message}" with the following public key?`,
                        ),
                        copyable(add0x(node.publicKey)),
                    ]),
                },
            });

            if (!approved) {
                throw new UserRejectedRequestError();
            }

            if (curve === 'ed25519' || curve === 'ed25519Bip32') {
                const signed = await signEd25519(
                    stringToBytes(message),
                    remove0x(node.privateKey).slice(0, 64),
                );
                return bytesToHex(signed);
            }

            if (curve === 'secp256k1') {
                const signed = await signSecp256k1(
                    stringToBytes(message),
                    remove0x(node.privateKey),
                );
                return bytesToHex(signed);
            }

            // This is guaranteed to never happen because of the `assert` above. But
            // TypeScript doesn't know that, so we need to throw an error here.
            throw new Error(`Unsupported curve: ${String(curve)}.`);
        }
        default:
            throw new Error('Method not found.');
    }
};
