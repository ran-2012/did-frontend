import {expect, test} from "vitest";
import * as Crypto from '../src/crypto/crypto'

test('generateKey', async () => {
    const key = await Crypto.createKeyPair('1');
    expect(key).not.toBeNull();
    expect(key.pk).not.toBeNull();
    expect(key.sk).not.toBeNull();
    const key2 = await Crypto.createKeyPair('1');
    expect(JSON.stringify(key.pk)).toEqual(JSON.stringify(key2.pk));
    expect(JSON.stringify(key.sk)).toEqual(JSON.stringify(key2.sk));
})

test('encrypt test', async () => {
    const key = await Crypto.createKeyPair('1');
    const encrypted = Crypto.encrypt('hello', key.pk);
    const decrypted = Crypto.decrypt(encrypted, key.sk);
    expect(decrypted).toEqual('hello');
})