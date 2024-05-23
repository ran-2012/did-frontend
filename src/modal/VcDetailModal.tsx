import {
    CloseButton, ListGroup,
    ListGroupItem,
    Modal,
    ModalBody,
    ModalHeader,
    ModalTitle
} from "react-bootstrap";
import ModalPortal from "./ModalPortal.tsx";
import {VerifiableCredential} from "@veramo/core";
import {formatDid} from "../veramo/utility.ts";
import {Button, Card, Descriptions, Table, TableColumnsType} from 'antd'
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

    function getTitle() {
        if (param.title) {
            return (
                <ModalHeader>
                    <ModalTitle>
                        {param.title}
                    </ModalTitle>
                    <CloseButton onClick={param.onClose}/>
                </ModalHeader>
            )
        } else {
            return <></>
        }
    }

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

    function getExpirationDate(){
        if (credential.expirationDate) {
            return dayjs(credential.expirationDate).format('YYYY-MM-DD HH:mm:ss')
        } else {
            return (<div style={{color: 'gray'}}>No expiration date</div>)
        }
    }

    function getIsValid() {
        return isValid ?
            (<div style={{color: 'blue'}}>
                Valid
            </div>) :
            (<div style={{color: 'red'}} >
                Invalid
            </div>)
    }

    // DETAIL: TYPE, SUBJECT, ISSUER, DATES, IS_VALID
    return (
        <ModalPortal>
            <Modal
                size={'lg'}
                // centered
                show={param.show}
                onHide={() => param.onClose()}>
                {/*{getTitle()}*/}
                <ModalBody>
                    <Card title={getType()}>
                        <Descriptions column={1} layout={'horizontal'}>
                            <Descriptions.Item label={'Issuer'}>
                                {getIssuer()}
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
                </ModalBody>
                <Modal.Footer>
                    <Button onClick={param.onClose}>Close</Button>
                </Modal.Footer>
            </Modal>
        </ModalPortal>
    );
}

export default VcDetailModal;