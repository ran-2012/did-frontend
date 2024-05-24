import VcDetailModal from "../modal/VcDetailModal.tsx";
import {useState} from "react";
import {VerifiableCredential} from "@veramo/core";
import {Button, Flex, List} from "antd";
import {useMasca} from "../masca/utility.ts";
import toast from "../toast.ts";
import {isSuccess} from "@blockchain-lab-um/masca-connector";
import {VcUtility} from "../veramo/utility.ts";

interface Param {

}

function getTestVc() {
    const testVcString = `{"type":["VerifiableCredential","MascaUserCredential"],"credentialSubject":{"id":"did:ethr:0x0FDf03D766559816E67B29Df9DE663aE1A6E6101","type":"Regular User"},"credentialSchema":{"id":"https://beta.api.schemas.serto.id/v1/public/program-completion-certificate/1.0/json-schema.json","type":"JsonSchemaValidator2018"},"@context":["https://www.w3.org/2018/credentials/v1"],"issuer":"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101","issuanceDate":"2024-05-23T08:43:55.455Z","proof":{"verificationMethod":"did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101#controller","created":"2024-05-23T08:43:55.455Z","proofPurpose":"assertionMethod","type":"EthereumEip712Signature2021","proofValue":"0xc5e02e9a24a5ce7e6780a5ea42aae45f764301962a10d839b77e36c5b062b80746e8d94a76acb3c587486b67543b86656614d8af4f5bcce75309ea84fea53a8f1c","eip712":{"domain":{"chainId":11155111,"name":"VerifiableCredential","version":"1"},"types":{"EIP712Domain":[{"name":"name","type":"string"},{"name":"version","type":"string"},{"name":"chainId","type":"uint256"}],"CredentialSchema":[{"name":"id","type":"string"},{"name":"type","type":"string"}],"CredentialSubject":[{"name":"id","type":"string"},{"name":"type","type":"string"}],"Proof":[{"name":"created","type":"string"},{"name":"proofPurpose","type":"string"},{"name":"type","type":"string"},{"name":"verificationMethod","type":"string"}],"VerifiableCredential":[{"name":"@context","type":"string[]"},{"name":"credentialSchema","type":"CredentialSchema"},{"name":"credentialSubject","type":"CredentialSubject"},{"name":"issuanceDate","type":"string"},{"name":"issuer","type":"string"},{"name":"proof","type":"Proof"},{"name":"type","type":"string[]"}]},"primaryType":"VerifiableCredential"}}}`
    return JSON.parse(testVcString) as VerifiableCredential
}

function VcList(param: Param) {
    const mosca = useMasca();
    const [currentVc, setCurrentVc] = useState<VerifiableCredential>(getTestVc)
    const [isLoading, setIsLoading] = useState(false)
    const [vcList, setVcList] = useState<VerifiableCredential[]>([])
    const [show, setShow] = useState(false);

    function loadCredential() {
        setTimeout(async () => {
            if (mosca.api) {
                toast.info("Requesting Credential")
                setIsLoading(true)
                try {
                    const result = await mosca.api.queryCredentials()
                    if (isSuccess(result)) {
                        toast.success("Credential loaded")
                        const list: VerifiableCredential[] = [];
                        for (const vcQueryResult of result.data) {
                            list.push(vcQueryResult.data);
                            vcQueryResult.data
                        }
                        console.log(`${list.length} credentials loaded`)
                        setVcList(list)
                    } else {
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
        })
    }

    function showModal(vc: VerifiableCredential | null = null) {
        if (vc != null) {
            setCurrentVc(vc)
        } else {
            setCurrentVc(getTestVc())
        }
        setShow(true)
    }

    function closeVcDetailModal() {
        console.log("close")
        setShow(false);
    }

    function getDescription(vc: VerifiableCredential) {
        return (<p>
            <strong>Issuer: </strong><span className={'font-monospace'}>{VcUtility.getIssuer(vc, true)}</span><br/>
            <strong>Issuance Date: </strong>{vc.issuanceDate}
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
                    showModal()
                }}>
                    Demo Credential
                </Button>
            </Flex>
            <List bordered
                  className={'m-2 flex-grow-1'}
                  dataSource={vcList}
                  loading={isLoading}
                  renderItem={(item, index) => (
                      <List.Item key={index} actions={[<a onClick={() => {
                          showModal(item)
                      }}>Detail</a>]}>
                          <List.Item.Meta
                              title={VcUtility.getTypeString(item)}
                              description={getDescription(item)}/>
                      </List.Item>
                  )}></List>
            <VcDetailModal vc={currentVc} title={'Verifiable Credential Detail'} show={show}
                           onClose={closeVcDetailModal}/>
        </Flex>
    );
}

export default VcList;