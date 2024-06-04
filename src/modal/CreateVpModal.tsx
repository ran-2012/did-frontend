import React from "react";
import {Button, Card, Descriptions, Divider, Flex, List, Modal} from "antd";
import {isSuccess} from "@blockchain-lab-um/masca-connector";
import {VerifiablePresentation} from "@veramo/core";
import {useMasca, useMascaCallWrapper, VC} from "../masca/utility.ts";
import {VcUtility} from "../veramo/utility.ts";
import {VcUiUtility} from "../veramo/uiUtility.tsx";

interface Param {
    show: boolean,
    vcList: VC[]
    onClose: () => void;
    onCreatedVp: (vp: VerifiablePresentation) => void;
}


function CreateVpModal(param: Param) {
    const {api} = useMasca()
    const callWrapper = useMascaCallWrapper()

    function createVp() {
        setTimeout(async () => {
            const result = await callWrapper.call(api?.createPresentation, {
                infoMsg: 'Creating Presentation',
                successMsg: 'Presentation created',
                errorMsg: 'Failed to create Presentation'
            }, {
                vcs: param.vcList.map(vc => vc.data),
                proofFormat: 'EthereumEip712Signature2021',
            })
            if (isSuccess(result)) {
                param.onCreatedVp(result.data);
            }
        })
    }

    return (
        <Modal
            title={(<span className={'fs-4'}>Create Verifiable Presentation</span>)}
            open={param.show}
            footer={(<>
                <Button type={'default'} onClick={param.onClose}>Cancel</Button>
                <Button type={'primary'} onClick={createVp}>Create</Button>
            </>)}>

            <List>
                {param.vcList.map((vc, index) => {
                    return (
                        <Card key={index} className={'mb-2'} title={(<>
                            <span
                                className={'fs-5 me-2'}>{index}
                            </span>
                            {VcUtility.getTypeString(vc.data)}</>)}>
                            <Descriptions column={1} layout={'horizontal'}>
                                <Descriptions.Item label={'Issuer'}>
                                    <div
                                        className={'font-monospace'}>{VcUtility.getIssuer(vc.data, true)}</div>
                                </Descriptions.Item>
                                <Descriptions.Item label={'Status'}>
                                    {VcUiUtility.getIsExpired(vc.data)}
                                </Descriptions.Item>
                            </Descriptions>
                        </Card>
                    )
                })}
            </List>
        </Modal>
    );
}

export default CreateVpModal;