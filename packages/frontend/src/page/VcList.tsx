import {useRef, useState} from "react";
import {Button, Checkbox, Flex, GetProp, List, Tooltip} from "antd";
import {isSuccess} from "@blockchain-lab-um/masca-connector";
import {VerifiableCredential, VerifiablePresentation} from "@veramo/core";
import {QrcodeOutlined} from "@ant-design/icons";
import VcDetailModal from "../modal/VcDetailModal.tsx";
import {useMasca, useMascaCallWrapper, VC} from "../masca/utility.ts";
import {VcUtility} from "../veramo/utility.ts";
import JsonRawModal from "../modal/JsonRawModal.tsx";
import OkCancelModal from "../modal/OkCancelModal.tsx";
import QrCodeModal from "../modal/QrCodeModal.tsx";
import {compressToBase64} from "../utility/compress.ts";

import '../component/styles.css'
import CreateVpModal from "../modal/CreateVpModal.tsx";
import {useMyModal} from "../modal/ModalProvider.tsx";

interface Param {

}

function getTestVc(): VC {
    const testVcString = `{"type":["VC","MascaUserCredential"],"credentialSubject":{"id":"did:ethr:0x0FDf03D766559816E67B29Df9DE663aE1A6E6101","type":"Regular User"},"credentialSchema":{"id":"https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json","type":"JsonSchemaValidator2018"},"@context":["https://www.w3.org/2018/credentials/v1"],"issuer":"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101","issuanceDate":"2024-05-23T08:43:55.455Z","proof":{"verificationMethod":"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101#controller","created":"2024-05-23T08:43:55.455Z","proofPurpose":"assertionMethod","type":"EthereumEip712Signature2021","proofValue":"0xc5e02e9a24a5ce7e6780a5ea42aae45f764301962a10d839b77e36c5b062b80746e8d94a76acb3c587486b67543b86656614d8af4f5bcce75309ea84fea53a8f1c","eip712":{"domain":{"chainId":11155111,"name":"VC","version":"1"},"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"}],"CredentialSchema":[{"name":"id","type":"string"},{"name":"type","type":"string"}],"CredentialSubject":[{"name":"id","type":"string"},{"name":"type","type":"string"}],"Proof":[{"name":"created","type":"string"},{"name":"proofPurpose","type":"string"},{"name":"type","type":"string"},{"name":"verificationMethod","type":"string"}],"VC":[{"name":"@context","type":"string[]"},{"name":"credentialSchema","type":"CredentialSchema"},{"name":"credentialSubject","type":"CredentialSubject"},{"name":"issuanceDate","type":"string"},{"name":"issuer","type":"string"},{"name":"proof","type":"Proof"},{"name":"type","type":"string[]"}]},"primaryType":"VC"}}}`
    return {
        data: JSON.parse(testVcString) as VerifiableCredential,
        metadata: {id: '', store: []}
    }
}

type OnCheckChange = GetProp<typeof Checkbox.Group, 'onChange'>;

function VcList(param: Param) {
    const mosca = useMasca();
    const mascaWrapper = useMascaCallWrapper();

    const [isLoading, setIsLoading] = useState(false)

    const displayVc = useRef<VC>(getTestVc());
    const showVcModalFunc = useMyModal(VcDetailModal);

    const [vcList, setVcList] = useState<VC[]>([])

    const [jsonStr, setJsonStr] = useState('' as string)
    const [isShowJsonModal, _setIsShowJsonModal] = useState(false);

    const [isShowDeleteConfirmModal, setIsShowDeleteConfirmModal] = useState(false);
    const [isShowQrCodeModal, setIsShowQrCodeModal] = useState(false);
    const [selectedVcList, setSelectedVcList] = useState<VC[]>([]);
    const [isShowCreateVpModal, setIsShowCreateVpModal] = useState(false);

    const selected = useRef<number[]>([])
    const [selectedCount, setSelectedCount] = useState(0)

    const onChange: OnCheckChange = (checkValue) => {
        console.log(checkValue);
        selected.current = []
        for (const checked of checkValue) {
            if (typeof checked == 'number') {
                selected.current.push(checked)
            }
        }
        setSelectedCount(selected.current.length)
        setSelectedVcList(selected.current.map(index => vcList[index]))
    }

    async function loadCredential() {
        const res = await mascaWrapper.call(mosca.api?.queryCredentials, {
            infoMsg: 'Requesting Credential',
            successMsg: 'Credential loaded',
            errorMsg: 'Failed to load Credential'
        },)
        if (isSuccess(res)) {
            setVcList(res.data)
            return true;
        } else {
            return false;
        }
    }

    async function deleteCredential() {
        return isSuccess(await mascaWrapper.call(mosca.api?.deleteCredential, {
            infoMsg: 'Deleting Credential',
            successMsg: 'Credential deleted',
            errorMsg: 'Failed to delete Credential',
            isLoading: setIsLoading,
        }, displayVc.current.metadata.id))
    }

    function updateCurrentVc(vc: VC | null = null) {
        if (vc != null) {
            displayVc.current = vc;
        } else {
            displayVc.current = getTestVc();
        }
    }

    function showVcModal() {
        console.log('showVcModalFunc: ' + showVcModalFunc)
        if (!showVcModalFunc) return;
        showVcModalFunc.show({vc: displayVc.current.data, title: 'Verifiable Credential Detail'})
    }

    function getDescription(vc: VC) {
        return (<p>
            <strong>Issuer: </strong><span className={'font-monospace'}>{VcUtility.getIssuer(vc.data, true)}</span><br/>
            <strong>Issuance Date: </strong>{vc.data.issuanceDate}
        </p>)
    }

    function showJsonModal(data: object) {
        setJsonStr(JSON.stringify(data, null, 2))
        _setIsShowJsonModal(true)
    }

    function showQrCodeModal() {

    }

    // BRIEF: ISSUER, DATE, TYPE
    // DETAIL: TYPE, SUBJECT, ISSUER, DATES, IS_VALID
    return (
        <Flex className='d-flex flex-column m-2 w-100'>
            <Flex className={'justify-content-between m-2'}>
                <div className={''}>
                    <Button size={'large'} type={'primary'} className={'me-2'} onClick={loadCredential}>Load
                        Credential</Button>
                    <Tooltip title={'Select at least 1 Credential to create Presentation'}>
                        <Button size={'large'} type={'primary'} disabled={selectedCount == 0}
                                onClick={() => {
                                    setIsShowCreateVpModal(true)
                                }}>
                            Create Presentation
                        </Button>
                    </Tooltip>
                </div>
                <div className={'align-self-end'}>
                    <Button size={'large'} className={'me-2'} onClick={() => {
                        showVcModal()
                    }}>
                        Demo Credential
                    </Button>
                    <Button size={'large'} className={''} onClick={() => {
                        showJsonModal(getTestVc().data)
                    }}>
                        Demo Credential Full
                    </Button>
                </div>
            </Flex>
            <Checkbox.Group className={'flex-grow-1'}
                            onChange={onChange}>
                <List bordered
                      className={'m-2 flex-grow-1'}
                      dataSource={vcList}
                      loading={isLoading}
                      renderItem={(item, index) => (
                          <Flex className={'h-100 w-100 justify-content-center hover'}
                                style={{borderBottom: '1px solid lightgray'}}>
                              <Checkbox className={'ms-4'} value={index}></Checkbox>
                              <List.Item className={'flex-grow-1'}
                                         key={index} actions={[
                                  <a className={'align-self-center text-decoration-none'}
                                     onClick={() => setIsShowQrCodeModal(true)}>
                                      <QrcodeOutlined className={'align-self-center'} style={{fontSize: '20px'}}/> QR
                                      Code
                                  </a>,
                                  <a className={'text-decoration-none'} onClick={() => {
                                      updateCurrentVc(item)
                                      showVcModal()
                                  }}>Detail</a>,
                                  <a className={'text-decoration-none'} onClick={() => {
                                      updateCurrentVc(item)
                                      showJsonModal(item.data)
                                  }}>Full Text</a>,
                                  <a className={'text-decoration-none'} onClick={() => {
                                      updateCurrentVc(item)
                                      setIsShowDeleteConfirmModal(true)
                                  }} style={{color: 'red'}}>Delete</a>]}>
                                  <List.Item.Meta
                                      title={VcUtility.getTypeString(item.data)}
                                      description={getDescription(item)}/>
                              </List.Item>
                          </Flex>
                      )}></List>
            </Checkbox.Group>
            <JsonRawModal show={isShowJsonModal} json={jsonStr}
                          onClose={() => _setIsShowJsonModal(false)}/>
            <OkCancelModal show={isShowDeleteConfirmModal} message={'Deletion is irreversible. Are you sure?'}
                           onOk={() => {
                               setIsShowDeleteConfirmModal(false)
                               setTimeout(async () => {
                                   if (await deleteCredential()) {
                                       await loadCredential()
                                   }
                               })
                           }}
                           onCancel={() => setIsShowDeleteConfirmModal(false)}/>
            <QrCodeModal show={isShowQrCodeModal} onClose={() => setIsShowQrCodeModal(false)}
                         qrString={compressToBase64(displayVc.current.data)}/>
            <CreateVpModal show={isShowCreateVpModal} vcList={selectedVcList}
                           onClose={() => {
                               setIsShowCreateVpModal(false)
                           }}
                           onCreatedVp={(vp: VerifiablePresentation) => {
                               setIsShowCreateVpModal(false)
                               showJsonModal(vp)
                           }}/>
        </Flex>
    );
}

export default VcList;