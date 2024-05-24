import {VerifiableCredential} from "@veramo/core";
import {formatDid} from "../veramo/utility.ts";
import {Button, Card, Descriptions, Modal, Table, TableColumnsType, Tag} from 'antd'
import React, {useMemo} from "react";
import dayjs from 'dayjs';

interface Param {
    title?: string
    vc: VerifiableCredential
    show: boolean
    onClose: () => void;
}

interface SubjectData {
    key: string,
    value: string
}

function VcDetailModal(param: Param) {
    const credential = param.vc;
    const isValid = useMemo(() => {
        if (!credential.expirationDate) return true;
        return Date.parse(credential.expirationDate) > Date.now();
    }, [credential]);


    function getType() {
        if (!credential.type) {
            return 'Unknown Credential'
        }
        if (typeof credential.type === 'string') {
            return credential.type;
        } else {
            return credential.type.join(', ');
        }
    }

    function getIssuer() {
        if (typeof credential.issuer == 'string') {
            return formatDid(credential.issuer)
        }
        return formatDid(credential.issuer.id)
    }

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

    function getIsValid() {
        return isValid ?
            (<Tag color={'blue'}>
                Valid
            </Tag>) :
            (<Tag color={'red'}>
                Invalid
            </Tag>)
    }

    // DETAIL: TYPE, SUBJECT, ISSUER, DATES, IS_VALID
    return (
        <div style={{width: "fit-content"}}>

            <Modal
                open={param.show}
                title={'Credential Detail'}
                width={'auto'}
                footer={(_, {OkBtn, CancelBtn}) => (
                    <>
                        <OkBtn/>
                    </>
                )}
                onOk={() => param.onClose()}
                onCancel={() => param.onClose()}>
                <Card title={getType()}>
                    <Descriptions column={1} layout={'horizontal'}>
                        <Descriptions.Item label={'Issuer'}>
                            <div className={'font-monospace'}>{getIssuer()}</div>
                        </Descriptions.Item>
                        <Descriptions.Item label={'Issue Date'}>
                            {dayjs(credential.issuanceDate).format('YYYY-MM-DD HH:mm:ss')}
                        </Descriptions.Item>
                        <Descriptions.Item label={'Expiration Date'}>
                            {getExpirationDate()}
                        </Descriptions.Item>
                        <Descriptions.Item label={'Status'}>
                            {getIsValid()}
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