import VcDetailModal from "../modal/VcDetailModal.tsx";
import {useState} from "react";
import {Button, Flex, List} from "antd";
import {useMasca} from "../masca/utility.ts";
import toast from "../toast.ts";
import {isSuccess, QueryCredentialsRequestResult} from "@blockchain-lab-um/masca-connector";
import {VcUtility} from "../veramo/utility.ts";
import JsonRawModal from "../modal/JsonRawModal.tsx";
import OkCancelModal from "../modal/OkCancelModal.tsx";
import {VerifiableCredential} from "@veramo/core";

interface Param {

}

// VC with metadata which is used for managing vc storage in snap
type VC = QueryCredentialsRequestResult;

function getTestVc(): VC {
    const testVcString = `{"type":["VC","MascaUserCredential"],"credentialSubject":{"id":"did:ethr:0x0FDf03D766559816E67B29Df9DE663aE1A6E6101","type":"Regular User"},"credentialSchema":{"id":"https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json","type":"JsonSchemaValidator2018"},"@context":["https://www.w3.org/2018/credentials/v1"],"issuer":"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101","issuanceDate":"2024-05-23T08:43:55.455Z","proof":{"verificationMethod":"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101#controller","created":"2024-05-23T08:43:55.455Z","proofPurpose":"assertionMethod","type":"EthereumEip712Signature2021","proofValue":"0xc5e02e9a24a5ce7e6780a5ea42aae45f764301962a10d839b77e36c5b062b80746e8d94a76acb3c587486b67543b86656614d8af4f5bcce75309ea84fea53a8f1c","eip712":{"domain":{"chainId":11155111,"name":"VC","version":"1"},"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"}],"CredentialSchema":[{"name":"id","type":"string"},{"name":"type","type":"string"}],"CredentialSubject":[{"name":"id","type":"string"},{"name":"type","type":"string"}],"Proof":[{"name":"created","type":"string"},{"name":"proofPurpose","type":"string"},{"name":"type","type":"string"},{"name":"verificationMethod","type":"string"}],"VC":[{"name":"@context","type":"string[]"},{"name":"credentialSchema","type":"CredentialSchema"},{"name":"credentialSubject","type":"CredentialSubject"},{"name":"issuanceDate","type":"string"},{"name":"issuer","type":"string"},{"name":"proof","type":"Proof"},{"name":"type","type":"string[]"}]},"primaryType":"VC"}}}`
    return {
        data: JSON.parse(testVcString) as VerifiableCredential,
        metadata: {id: '', store: []}
    }
}

function VcList(param: Param) {
    const mosca = useMasca();
    const [currentVc, setCurrentVc] = useState<VC>(getTestVc)
    const [isLoading, setIsLoading] = useState(false)
    const [vcList, setVcList] = useState<VC[]>([])
    const [isShowVcModal, setIsShowVcModal] = useState(false);
    const [isShowJsonModal, setIsShowJsonModal] = useState(false);
    const [isShowDeleteConfirmModal, setIsShowDeleteConfirmModal] = useState(false);

    async function loadCredential() {
        if (mosca.api) {
            toast.info("Requesting Credential")
            setIsLoading(true)
            try {
                const result = await mosca.api.queryCredentials()
                if (isSuccess(result)) {
                    toast.success("Credential loaded")
                    console.log(`${result.data.length} credentials loaded`)
                    setVcList(result.data)
                    setIsLoading(false)
                    return true;
                } else {
                    console.log(result.error)
                    toast.error("Failed to load Credential")
                }
            } catch (e) {
                console.log(e)
                toast.error("Failed to load Credential")
            }
            setIsLoading(false)
        } else {
            toast.error("Masca is not connected")
        }
        return false;
    }

    async function deleteCredential() {
        if (mosca.api) {
            toast.info("Deleting Credential")
            try {
                const result = await mosca.api.deleteCredential(currentVc.metadata.id)
                if (isSuccess(result)) {
                    toast.success("Credential deleted")
                    console.log(`Credential deleted`)
                    return true;
                } else {
                    console.log(result.error)
                    toast.error("Failed to delete Credential")
                }
            } catch (e) {
                console.log(e)
                toast.error("Failed to delete Credential")
            }
            setIsLoading(false)
        } else {
            toast.error("Masca is not connected")
        }
        return false;
    }

    function updateCurrentVc(vc: VC | null = null) {
        if (vc != null) {
            setCurrentVc(vc)
        } else {
            setCurrentVc(getTestVc())
        }
    }

    function closeVcDetailModal() {
        setIsShowVcModal(false);
    }

    function getDescription(vc: VC) {
        return (<p>
            <strong>Issuer: </strong><span className={'font-monospace'}>{VcUtility.getIssuer(vc.data, true)}</span><br/>
            <strong>Issuance Date: </strong>{vc.data.issuanceDate}
        </p>)
    }

    // BRIEF: ISSUER, DATE, TYPE
    // DETAIL: TYPE, SUBJECT, ISSUER, DATES, IS_VALID
    return (
        <Flex className='d-flex flex-column m-2 w-100'>
            <Flex className={'justify-content-start'}>
                <Button size={'large'} type={'primary'} className={'m-1'} onClick={loadCredential}>Load
                    Credential</Button>
                <Button size={'large'} className={'m-1'} onClick={() => {
                    setIsShowVcModal(true)
                }}>
                    Demo Credential
                </Button>
                <Button size={'large'} className={'m-1'} onClick={() => {
                    setIsShowJsonModal(true)
                }}>
                    Demo Credential Full
                </Button>
            </Flex>
            <List bordered
                  className={'m-2 flex-grow-1'}
                  dataSource={vcList}
                  loading={isLoading}
                  renderItem={(item, index) => (
                      <List.Item key={index} actions={[
                          <a onClick={() => {
                              updateCurrentVc(item)
                              setIsShowVcModal(true)
                          }}>Detail</a>,
                          <a onClick={() => {
                              updateCurrentVc(item)
                              setIsShowJsonModal(true)
                          }}>Full Text</a>,
                          <a onClick={() => {
                              updateCurrentVc(item)
                              setIsShowDeleteConfirmModal(true)
                          }} style={{color: 'red'}}>Delete</a>]}>
                          <List.Item.Meta
                              title={VcUtility.getTypeString(item.data)}
                              description={getDescription(item)}/>
                      </List.Item>
                  )}></List>
            <VcDetailModal vc={currentVc.data} title={'Verifiable Credential Detail'} show={isShowVcModal}
                           onClose={closeVcDetailModal}/>
            <JsonRawModal show={isShowJsonModal} json={JSON.stringify(currentVc, null, 2)}
                          onClose={() => setIsShowJsonModal(false)}/>
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
        </Flex>
    );
}

export default VcList;