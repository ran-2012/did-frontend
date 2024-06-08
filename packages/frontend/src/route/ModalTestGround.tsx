import * as lz from 'lz-string';
import {VerifiableCredential, VerifiablePresentation} from "@veramo/core";
import {useEffect, useRef, useState} from "react";
import {VerificationService} from "@blockchain-lab-um/extended-verification";
import {JsonRpcProvider} from "ethers";
import QrCodeModal from "../modal/QrCodeModal.tsx";
import CreateVpModal from "../modal/CreateVpModal.tsx";
import JsonRawModal from "../modal/JsonRawModal.tsx";
import {getAgent} from "../veramo/setup.ts";

const data = '{\\"@context\\":[\\"https://www.w3.org/2018/credentials/v1\\"],\\"credentialSchema\\":{\\"id\\":\\"https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json\\",\\"type\\":\\"JsonSchemaValidator2018\\"},\\"credentialSubject\\":{\\"id\\":\\"did:ethr:0x0FDf03D766559816E67B29Df9DE663aE1A6E6101\\",\\"key\\":\\"value\\",\\"type\\":\\"Regular User\\"},\\"issuanceDate\\":\\"2024-05-26T11:04:01.567Z\\",\\"issuer\\":\\"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101\\",\\"proof\\":{\\"created\\":\\"2024-05-26T11:04:01.567Z\\",\\"eip712\\":{\\"domain\\":{\\"chainId\\":11155111,\\"name\\":\\"VerifiableCredential\\",\\"version\\":\\"1\\"},\\"primaryType\\":\\"VerifiableCredential\\",\\"types\\":{\\"CredentialSchema\\":[{\\"name\\":\\"id\\",\\"type\\":\\"string\\"},{\\"name\\":\\"type\\",\\"type\\":\\"string\\"}],\\"CredentialSubject\\":[{\\"name\\":\\"id\\",\\"type\\":\\"string\\"},{\\"name\\":\\"key\\",\\"type\\":\\"string\\"},{\\"name\\":\\"type\\",\\"type\\":\\"string\\"}],\\"EIP712Domain\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"version\\",\\"type\\":\\"string\\"},{\\"name\\":\\"chainId\\",\\"type\\":\\"uint256\\"}],\\"Proof\\":[{\\"name\\":\\"created\\",\\"type\\":\\"string\\"},{\\"name\\":\\"proofPurpose\\",\\"type\\":\\"string\\"},{\\"name\\":\\"type\\",\\"type\\":\\"string\\"},{\\"name\\":\\"verificationMethod\\",\\"type\\":\\"string\\"}],\\"VerifiableCredential\\":[{\\"name\\":\\"@context\\",\\"type\\":\\"string[]\\"},{\\"name\\":\\"credentialSchema\\",\\"type\\":\\"CredentialSchema\\"},{\\"name\\":\\"credentialSubject\\",\\"type\\":\\"CredentialSubject\\"},{\\"name\\":\\"issuanceDate\\",\\"type\\":\\"string\\"},{\\"name\\":\\"issuer\\",\\"type\\":\\"string\\"},{\\"name\\":\\"proof\\",\\"type\\":\\"Proof\\"},{\\"name\\":\\"type\\",\\"type\\":\\"string[]\\"}]}},\\"proofPurpose\\":\\"assertionMethod\\",\\"proofValue\\":\\"0xb7052e0936c7bcd540713a8eefa3206e4aa1ce10300c779babb71e23797f84c82970e16f7e8e71144e0f0dcffa346b12a07207a0abcbd792eca313f9c181adcf1c\\",\\"type\\":\\"EthereumEip712Signature2021\\",\\"verificationMethod\\":\\"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101#controller\\"},\\"type\\":[\\"VerifiableCredential\\",\\"MascaUserCredential\\"]}'
const data2 = `{
    "holder": "did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101",
    "verifiableCredential": [
        "{\\"@context\\":[\\"https://www.w3.org/2018/credentials/v1\\"],\\"credentialSchema\\":{\\"id\\":\\"https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json\\",\\"type\\":\\"JsonSchemaValidator2018\\"},\\"credentialSubject\\":{\\"id\\":\\"did:ethr:0x0FDf03D766559816E67B29Df9DE663aE1A6E6101\\",\\"key\\":\\"value\\",\\"type\\":\\"Regular User\\"},\\"issuanceDate\\":\\"2024-05-26T11:04:01.567Z\\",\\"issuer\\":\\"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101\\",\\"proof\\":{\\"created\\":\\"2024-05-26T11:04:01.567Z\\",\\"eip712\\":{\\"domain\\":{\\"chainId\\":11155111,\\"name\\":\\"VerifiableCredential\\",\\"version\\":\\"1\\"},\\"primaryType\\":\\"VerifiableCredential\\",\\"types\\":{\\"CredentialSchema\\":[{\\"name\\":\\"id\\",\\"type\\":\\"string\\"},{\\"name\\":\\"type\\",\\"type\\":\\"string\\"}],\\"CredentialSubject\\":[{\\"name\\":\\"id\\",\\"type\\":\\"string\\"},{\\"name\\":\\"key\\",\\"type\\":\\"string\\"},{\\"name\\":\\"type\\",\\"type\\":\\"string\\"}],\\"EIP712Domain\\":[{\\"name\\":\\"name\\",\\"type\\":\\"string\\"},{\\"name\\":\\"version\\",\\"type\\":\\"string\\"},{\\"name\\":\\"chainId\\",\\"type\\":\\"uint256\\"}],\\"Proof\\":[{\\"name\\":\\"created\\",\\"type\\":\\"string\\"},{\\"name\\":\\"proofPurpose\\",\\"type\\":\\"string\\"},{\\"name\\":\\"type\\",\\"type\\":\\"string\\"},{\\"name\\":\\"verificationMethod\\",\\"type\\":\\"string\\"}],\\"VerifiableCredential\\":[{\\"name\\":\\"@context\\",\\"type\\":\\"string[]\\"},{\\"name\\":\\"credentialSchema\\",\\"type\\":\\"CredentialSchema\\"},{\\"name\\":\\"credentialSubject\\",\\"type\\":\\"CredentialSubject\\"},{\\"name\\":\\"issuanceDate\\",\\"type\\":\\"string\\"},{\\"name\\":\\"issuer\\",\\"type\\":\\"string\\"},{\\"name\\":\\"proof\\",\\"type\\":\\"Proof\\"},{\\"name\\":\\"type\\",\\"type\\":\\"string[]\\"}]}},\\"proofPurpose\\":\\"assertionMethod\\",\\"proofValue\\":\\"0xb7052e0936c7bcd540713a8eefa3206e4aa1ce10300c779babb71e23797f84c82970e16f7e8e71144e0f0dcffa346b12a07207a0abcbd792eca313f9c181adcf1c\\",\\"type\\":\\"EthereumEip712Signature2021\\",\\"verificationMethod\\":\\"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101#controller\\"},\\"type\\":[\\"VerifiableCredential\\",\\"MascaUserCredential\\"]}"
    ],
    "type": [
        "VerifiablePresentation",
        "Custom"
    ],
    "@context": [
        "https://www.w3.org/2018/credentials/v1"
    ],
    "issuanceDate": "2024-05-29T08:41:23.987Z",
    "proof": {
        "verificationMethod": "did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101#controller",
        "created": "2024-05-29T08:41:23.987Z",
        "proofPurpose": "assertionMethod",
        "type": "EthereumEip712Signature2021",
        "proofValue": "0x9e7f0ffb21af355e559dfd99f15f8ce609da12b9cf2a792ad5b177775d5409c6114d03e130a73de2f09e17b868abefdb10dfee2937d2df184059cd138aed833a1c",
        "eip712": {
            "domain": {
                "chainId": 11155111,
                "name": "VerifiablePresentation",
                "version": "1"
            },
            "types": {
                "EIP712Domain": [
                    {
                        "name": "name",
                        "type": "string"
                    },
                    {
                        "name": "version",
                        "type": "string"
                    },
                    {
                        "name": "chainId",
                        "type": "uint256"
                    }
                ],
                "Proof": [
                    {
                        "name": "created",
                        "type": "string"
                    },
                    {
                        "name": "proofPurpose",
                        "type": "string"
                    },
                    {
                        "name": "type",
                        "type": "string"
                    },
                    {
                        "name": "verificationMethod",
                        "type": "string"
                    }
                ],
                "VerifiablePresentation": [
                    {
                        "name": "@context",
                        "type": "string[]"
                    },
                    {
                        "name": "holder",
                        "type": "string"
                    },
                    {
                        "name": "issuanceDate",
                        "type": "string"
                    },
                    {
                        "name": "proof",
                        "type": "Proof"
                    },
                    {
                        "name": "type",
                        "type": "string[]"
                    },
                    {
                        "name": "verifiableCredential",
                        "type": "string[]"
                    }
                ]
            },
            "primaryType": "VerifiablePresentation"
        }
    }
}`
const testVcString = `{"type":["VC","MascaUserCredential"],"credentialSubject":{"id":"did:ethr:0x0FDf03D766559816E67B29Df9DE663aE1A6E6101","type":"Regular User"},"credentialSchema":{"id":"https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json","type":"JsonSchemaValidator2018"},"@context":["https://www.w3.org/2018/credentials/v1"],"issuer":"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101","issuanceDate":"2024-05-23T08:43:55.455Z","proof":{"verificationMethod":"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101#controller","created":"2024-05-23T08:43:55.455Z","proofPurpose":"assertionMethod","type":"EthereumEip712Signature2021","proofValue":"0xc5e02e9a24a5ce7e6780a5ea42aae45f764301962a10d839b77e36c5b062b80746e8d94a76acb3c587486b67543b86656614d8af4f5bcce75309ea84fea53a8f1c","eip712":{"domain":{"chainId":11155111,"name":"VC","version":"1"},"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"}],"CredentialSchema":[{"name":"id","type":"string"},{"name":"type","type":"string"}],"CredentialSubject":[{"name":"id","type":"string"},{"name":"type","type":"string"}],"Proof":[{"name":"created","type":"string"},{"name":"proofPurpose","type":"string"},{"name":"type","type":"string"},{"name":"verificationMethod","type":"string"}],"VC":[{"name":"@context","type":"string[]"},{"name":"credentialSchema","type":"CredentialSchema"},{"name":"credentialSubject","type":"CredentialSubject"},{"name":"issuanceDate","type":"string"},{"name":"issuer","type":"string"},{"name":"proof","type":"Proof"},{"name":"type","type":"string[]"}]},"primaryType":"VC"}}}`

const validVc = `{
  "@context": [
    "https://www.w3.org/2018/credentials/v1"
  ],
  "credentialSchema": {
    "id": "https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json",
    "type": "JsonSchemaValidator2018"
  },
  "credentialSubject": {
    "id": "did:ethr:0x0FDf03D766559816E67B29Df9DE663aE1A6E6101",
    "key": "value",
    "type": "Regular User"
  },
  "issuanceDate": "2024-05-26T11:04:01.567Z",
  "issuer": "did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101",
  "proof": {
    "created": "2024-05-26T11:04:01.567Z",
    "eip712": {
      "domain": {
        "chainId": 11155111,
        "name": "VerifiableCredential",
        "version": "1"
      },
      "primaryType": "VerifiableCredential",
      "types": {
        "CredentialSchema": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "type",
            "type": "string"
          }
        ],
        "CredentialSubject": [
          {
            "name": "id",
            "type": "string"
          },
          {
            "name": "key",
            "type": "string"
          },
          {
            "name": "type",
            "type": "string"
          }
        ],
        "EIP712Domain": [
          {
            "name": "name",
            "type": "string"
          },
          {
            "name": "version",
            "type": "string"
          },
          {
            "name": "chainId",
            "type": "uint256"
          }
        ],
        "Proof": [
          {
            "name": "created",
            "type": "string"
          },
          {
            "name": "proofPurpose",
            "type": "string"
          },
          {
            "name": "type",
            "type": "string"
          },
          {
            "name": "verificationMethod",
            "type": "string"
          }
        ],
        "VerifiableCredential": [
          {
            "name": "@context",
            "type": "string[]"
          },
          {
            "name": "credentialSchema",
            "type": "CredentialSchema"
          },
          {
            "name": "credentialSubject",
            "type": "CredentialSubject"
          },
          {
            "name": "issuanceDate",
            "type": "string"
          },
          {
            "name": "issuer",
            "type": "string"
          },
          {
            "name": "proof",
            "type": "Proof"
          },
          {
            "name": "type",
            "type": "string[]"
          }
        ]
      }
    },
    "proofPurpose": "assertionMethod",
    "proofValue": "0xb7052e0936c7bcd540713a8eefa3206e4aa1ce10300c779babb71e23797f84c82970e16f7e8e71144e0f0dcffa346b12a07207a0abcbd792eca313f9c181adcf1c",
    "type": "EthereumEip712Signature2021",
    "verificationMethod": "did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101#controller"
  },
  "type": [
    "VerifiableCredential",
    "MascaUserCredential"
  ]
}`

function getVc() {
    return {
        data: JSON.parse(testVcString) as VerifiableCredential,
        metadata: {id: '', store: []}
    }
}

function ModalTestGround() {
    const [qrString, setQrString] = useState('' as string)
    const [jsonStr, setJsonStr] = useState('' as string)
    const [showJson, setShowJson] = useState(false)
    const [showQr, setShowQr] = useState(false)
    const [showCreateVp, setShowCreateVp] = useState(true)

    useEffect(() => {
        setTimeout(async () => {
            await verify();
        })

    }, []);

    function getCompressedString() {
        console.log(`before: ${data2.length}`)
        const res = lz.compressToBase64(data2)
        console.log(`after : ${res.length}`)
        return res;
    }

    async function verify() {
        console.log('verify')
        VerificationService.init({
            providers: {
                sepolia: new JsonRpcProvider(
                    `https://sepolia.infura.io/v3/${import.meta.env.VITE_INFURA_ID}`
                )
            }
        }).then(() => {
            console.log('VerificationService initialized');
        })

        try {
            const res = await VerificationService.verify(validVc);
            console.log(res)
        } catch (e) {
            console.error(e);
        }
    }

    return (
        <div className='d-flex flex-column m-2'>
            <QrCodeModal show={showQr} onClose={() => {
            }} qrString={qrString}/>
            <JsonRawModal show={showJson} json={jsonStr} onClose={() => {
                setShowJson(false)
            }}/>
            <CreateVpModal
                vcList={[getVc(), getVc()]} show={showCreateVp}
                onClose={() => {
                    setShowCreateVp(false)
                }}
                onCreatedVp={(vp: VerifiablePresentation) => {
                    setShowJson(true);
                    setJsonStr(JSON.stringify(vp));
                }}/>
        </div>
    );
}

export default ModalTestGround;