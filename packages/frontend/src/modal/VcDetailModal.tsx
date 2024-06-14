import {VerifiableCredential} from "@veramo/core";
import {Button, Card, Descriptions, Modal, Spin, Table, TableColumnsType, Tag, Tooltip} from 'antd'
import {LoadingOutlined} from '@ant-design/icons';
import React, {useEffect, useMemo, useState} from "react";
import dayjs from 'dayjs';
import {isSuccess} from "@blockchain-lab-um/masca-connector";
import toast from "../toast.ts";
import {VcUtility} from "../veramo/utility.ts";
import {useMasca, useMascaCallWrapper, VC} from "../masca/utility.ts";
import {ValidState, VcUiUtility} from "../veramo/uiUtility.tsx";

interface Param {
    title?: string
    vc?: VerifiableCredential
    show: boolean
    showSaveButton?: boolean
    onClose: () => void;
}

interface SubjectData {
    key: string,
    value: string
}

function getTestVc(): VC {
    const testVcString = `{"type":["VC","MascaUserCredential"],"credentialSubject":{"id":"did:ethr:0x0FDf03D766559816E67B29Df9DE663aE1A6E6101","type":"Regular User"},"credentialSchema":{"id":"https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json","type":"JsonSchemaValidator2018"},"@context":["https://www.w3.org/2018/credentials/v1"],"issuer":"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101","issuanceDate":"2024-05-23T08:43:55.455Z","proof":{"verificationMethod":"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101#controller","created":"2024-05-23T08:43:55.455Z","proofPurpose":"assertionMethod","type":"EthereumEip712Signature2021","proofValue":"0xc5e02e9a24a5ce7e6780a5ea42aae45f764301962a10d839b77e36c5b062b80746e8d94a76acb3c587486b67543b86656614d8af4f5bcce75309ea84fea53a8f1c","eip712":{"domain":{"chainId":11155111,"name":"VC","version":"1"},"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"}],"CredentialSchema":[{"name":"id","type":"string"},{"name":"type","type":"string"}],"CredentialSubject":[{"name":"id","type":"string"},{"name":"type","type":"string"}],"Proof":[{"name":"created","type":"string"},{"name":"proofPurpose","type":"string"},{"name":"type","type":"string"},{"name":"verificationMethod","type":"string"}],"VC":[{"name":"@context","type":"string[]"},{"name":"credentialSchema","type":"CredentialSchema"},{"name":"credentialSubject","type":"CredentialSubject"},{"name":"issuanceDate","type":"string"},{"name":"issuer","type":"string"},{"name":"proof","type":"Proof"},{"name":"type","type":"string[]"}]},"primaryType":"VC"}}}`
    return {
        data: JSON.parse(testVcString) as VerifiableCredential,
        metadata: {id: '', store: []}
    }
}

function VcDetailModal(param: Param) {
    const masca = useMasca();
    const callWrapper = useMascaCallWrapper();
    const credential = param.vc ?? getTestVc().data;
    const [isValid, setIsValid] = useState<ValidState>(ValidState.Idle);
    const [invalidReason, setInvalidReason] = useState<string>('');

    useEffect(() => {
        if (!param.show) return;
        setTimeout(async () => {
            if (masca.api) {
                const res = await masca.api.verifyData({credential: credential});
                console.log(res)
                if (isSuccess(res)) {
                    setIsValid(ValidState.Valid);
                } else {
                    setInvalidReason(res.error);
                    setIsValid(ValidState.Invalid);
                }
            } else {
                toast.warn('Masca not connected')
                setIsValid(ValidState.Unknown)
            }
        })
    }, [param.vc, param.show]);

    function getColumn(): TableColumnsType<SubjectData> {
        return [
            {
                title: 'Key',
                dataIndex: 'key',
            },
            {
                title: 'Value',
                dataIndex: 'value',
            },
        ]
    }

    function getSubjectList() {
        const list: { key: string, value: string }[] = [];
        for (const key in credential.credentialSubject) {
            list.push({key: key, value: credential.credentialSubject[key]});
        }
        return list;
    }

    function getExpirationDate() {
        if (credential.expirationDate) {
            return dayjs(credential.expirationDate).format('YYYY-MM-DD HH:mm:ss')
        } else {
            return (<div style={{color: 'gray'}}>No expiration date</div>)
        }
    }

    function saveCredential() {
        console.log("Saving")
        callWrapper.call(masca.api?.saveCredential, {
                infoMsg: "Saving credential",
                successMsg: "Credential saved",
                errorMsg: "Failed to save credential"
            }, credential
        ).catch(() => {
        })
    }

    // DETAIL: TYPE, SUBJECT, ISSUER, DATES, IS_VALID
    return (
        <div style={{width: "fit-content"}}>

            <Modal
                open={param.show}
                title={'Credential Detail'}
                width={'80%'}
                style={{maxWidth: '1200px'}}
                footer={
                    <>
                        {param.showSaveButton && <Button onClick={saveCredential}>Save</Button>}
                        <Button type={'primary'} onClick={() => param.onClose()}>Close</Button>
                    </>
                }
                onOk={() => param.onClose()}
                onCancel={() => param.onClose()}>
                <Card title={VcUtility.getTypeString(credential)}>
                    <Descriptions column={1} layout={'horizontal'}>
                        <Descriptions.Item label={'Issuer'}>
                            <div className={'font-monospace'}>{VcUtility.getIssuer(credential, true)}</div>
                        </Descriptions.Item>
                        <Descriptions.Item label={'Issue Date'}>
                            {dayjs(credential.issuanceDate).format('YYYY-MM-DD HH:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label={'Expiration Date'}>
                            {getExpirationDate()}
                        </Descriptions.Item>
                        <Descriptions.Item label={'Status'}>
                            {VcUiUtility.getIsExpired(credential)}{VcUiUtility.getIsValid(isValid, invalidReason)}
                        </Descriptions.Item>
                        <Descriptions.Item label={'Subjects'}>
                            {' '}
                        </Descriptions.Item>
                    </Descriptions>
                    <Table bordered columns={getColumn()} dataSource={getSubjectList()}
                           pagination={false}>
                    </Table>
                </Card>
            </Modal>
        </div>
    );
}

export default VcDetailModal;