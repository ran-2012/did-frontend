import {Button, Card, Flex, Form, Input, Modal, Row, Space} from "antd";
import React, {useEffect, useState} from "react";
import {useAccount} from "wagmi";
import KeyValueList, {ItemParam} from "../component/KeyValueList.tsx";
import {createVerifiableCredential, getDid} from "../veramo/utility.ts";
import {useMyCrypto} from "../crypto/CryptoProvider.tsx";
import {useMyApi} from "../myapi/MyApiProvider.tsx";
import toast from "../toast.ts";
import {ModalBaseParam} from "./type.ts";

interface Param extends ModalBaseParam {
    initSubjectList?: ItemParam[]
}

type FieldType = {
    issuer: string,
    issuanceDate: string,
    type: string,
};

function MyFormContent() {
    const form = Form.useFormInstance<FieldType>();

    useEffect(() => {
        form.setFieldsValue({
            issuanceDate: (new Date()).toISOString(),
            type: "VerifiableCredential, DidDemoCredential"
        });
    }, [form]);

    return (
        <Card>
            <Form.Item<string>
                label={'Issuer'}
                name={'issuer'}
                rules={[{required: true, message: 'Please input issuer'}]}>
                <Input className={'font-monospace'} addonBefore={'did:ethr:0xaa36a7:'}/>
            </Form.Item>

            <Form.Item<string>
                label={'Issuance Date'}
                initialValue={new Date().toISOString()}
                rules={[{required: true}]}>
                <Space.Compact className={'w-100 d-flex'} style={{height: 'fit-content'}}>
                    <Form.Item noStyle={true} name={'issuanceDate'} className={'flex-grow-1'}>
                        <Input
                            className={'font-monospace'}
                        />
                    </Form.Item>
                    <Button type="primary"
                            onClick={() => form.setFieldValue('issuanceDate', (new Date()).toISOString())}>
                        Current time</Button>
                </Space.Compact>
            </Form.Item>

            <Form.Item<string>
                label={'Type'}
                initialValue={"VerifiableCredential, DidDemoCredential"}
                name={'type'}
                rules={[{required: true}]}>
                <Input className={'font-monospace'}/>
            </Form.Item>
        </Card>

    )
}

function CreateVcRequestModal(param: Param) {
    const {hasKey, crypto} = useMyCrypto();
    const {isLogin, api} = useMyApi();
    const [form] = Form.useForm()
    const account = useAccount();
    const [itemList, setItemList] =
        useState<ItemParam[]>(param.initSubjectList ?? []);

    useEffect(() => {
        if (itemList.length == 0) {
            setItemList([new ItemParam(0, 'id', getDid(account.address as string, 'ethr'), false)]);
        } else {
            itemList[0].key = 'id';
            itemList[0].value = getDid(account.address as string, 'ethr');
            setItemList(itemList)
        }
    }, [account]);

    function createNewVcRequest(values: FieldType) {
        console.log(values);
        const {issuer, issuanceDate, type} = values;

        const subject: { [key: string]: string } = {}
        itemList.forEach(item => {
            subject[item.key] = item.value;
        })

        const vc = createVerifiableCredential({
            issuer: getDid(issuer),
            issuanceDate,
            type: values.type.split(','),
            credentialSubject: subject
        })
        let vcStr = JSON.stringify(vc);
        let holderEncryptedVc = vcStr;

        setTimeout(async () => {
            console.log(vcStr);
            if (!isLogin) {
                toast.error("Please login first");
                return;
            }
            const issuerPk = await api.getPk(issuer);
            if (!issuerPk) {
                toast.warn("Key not found, sending plain text");
            } else {
                toast.info("Encrypting VC")
                try {
                    vcStr = crypto.encrypt(vcStr, issuerPk)
                } catch (e) {
                    console.log(e);
                }
            }
            if (!hasKey) {
                toast.warn("No key found, will receive plain text");
            } else {
                try {
                    holderEncryptedVc = crypto.encrypt(holderEncryptedVc);
                } catch (e) {
                    const error = e as Error;
                    toast.error("Failed to encrypt vc: " + error.message);
                    console.log(e);
                }
            }

            try {
                const requestBody = {
                    issuer,
                    holder: account.address!,
                    publicKey: crypto.exportPk() ?? '',
                    issuerPublicKey: issuerPk ?? '',
                    vc: vcStr,
                    signedVc: '',
                    holderEncryptedVc
                }
                console.log(requestBody)
                const response = await api.createRequest(requestBody)
                console.log(response);
            } catch (e) {
                const error = e as Error;
                toast.error(error.message);
                console.log(e);
                return;
            }

            toast.success('Request sent');
            param.onClose();
        })
    }

    function cleanAll() {
        setItemList([]);
    }

    return (
        <Modal
            open={param.show}
            title={'Create new VC Request'}
            width={'80%'}
            style={{maxWidth: '1200px'}}
            footer={null}
            onCancel={param.onClose}
            onClose={param.onClose}>
            <Form
                form={form}
                name={'vc-request'}
                labelCol={{span: 4}}
                wrapperCol={{span: 20}}
                onFinish={createNewVcRequest}
                onFinishFailed={() => {
                }}>
                <Flex className={'m-2 w-100 overflow-auto'} vertical={true}>
                    <MyFormContent/>
                    <div className={'w-100 mt-2'}>
                        <KeyValueList title={'Subjects'} list={itemList} onListUpdate={(items) => {
                            console.log(JSON.stringify(items));
                            if (items.length == 0) return;
                            setItemList(items);
                        }}/>
                    </div>
                    <Flex className={'justify-content-end mt-2'}>
                        <Space>
                            <Button type={'default'} onClick={param.onClose}>Cancel</Button>
                            <Button type={'primary'} htmlType={'submit'}>Create</Button>
                        </Space>
                    </Flex>
                </Flex>
            </Form>
        </Modal>
    );
}

export default CreateVcRequestModal;