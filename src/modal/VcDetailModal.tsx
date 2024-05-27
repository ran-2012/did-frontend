import {VerifiableCredential} from "@veramo/core";
import {VcUtility} from "../veramo/utility.ts";
import {Button, Card, Descriptions, Modal, Spin, Table, TableColumnsType, Tag, Tooltip} from 'antd'
import {LoadingOutlined} from '@ant-design/icons';
import React, {useEffect, useMemo, useState} from "react";
import dayjs from 'dayjs';
import {useMasca} from "../masca/utility.ts";
import toast from "../toast.ts";
import {isSuccess} from "@blockchain-lab-um/masca-connector";

interface Param {
    title?: string
    vc: VerifiableCredential
    show: boolean
    showSaveButton?: boolean
    onClose: () => void;
}

interface SubjectData {
    key: string,
    value: string
}

enum ValidState {
    Idle,
    Verifying,
    Valid,
    Invalid,
    Unknown,
}

function VcDetailModal(param: Param) {
    const masca = useMasca();
    const credential = param.vc;
    const [isValid, setIsValid] = useState<ValidState>(ValidState.Idle);
    const [invalidReason, setInvalidReason] = useState<string>('');
    const isNotExpired = useMemo(() => {
        if (!credential.expirationDate) return true;
        return Date.parse(credential.expirationDate) > Date.now();
    }, [credential]);

    useEffect(() => {
        if (!param.show) return;
        setTimeout(async () => {
            if (masca.api) {
                console.log("Verifying")
                setIsValid(ValidState.Verifying);
                const res = await masca.api.verifyData({credential: credential});
                console.log(res)
                if (isSuccess(res)) {
                    setIsValid(ValidState.Valid);
                } else {
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

    function getIsExpired() {
        return isNotExpired ?
            (<Tag color={'blue'}>
                Not expired
            </Tag>) :
            (<Tag color={'red'}>
                Expired
            </Tag>)
    }

    function getIsValid() {
        switch (isValid) {
            case ValidState.Idle:
                return '';
            case ValidState.Valid:
                return (<Tag color={'blue'}>Valid</Tag>);
            case ValidState.Invalid:
                return (<Tooltip title={invalidReason}><Tag color={'red'}>Invalid</Tag></Tooltip>);
            case ValidState.Verifying:
                return (
                    <Tooltip title={'Verifying...'}>
                        <Spin indicator={<LoadingOutlined spin/>}/>
                    </Tooltip>
                );
            case ValidState.Unknown:
                return (<Tag style={{color: 'gray'}}>Unknown</Tag>)
        }
    }

    function saveCredential() {
        console.log("Saving")
        if (masca.api) {
            toast.info("Saving credential")
            masca.api.saveCredential(credential).then((res) => {
                if (isSuccess(res)) {
                    toast.success("Credential saved")
                } else {
                    toast.error("Failed to save credential")
                }
            }).catch(() => {
                toast.error("Failed to save credential")
            })
        } else {
            console.log("Masca not found")
            toast.error("Masca not connected")
        }
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
                            {getIsExpired()}{getIsValid()}
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