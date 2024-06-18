import {Button, Card, Descriptions, Flex, List, Tabs, TabsProps, Tooltip} from "antd";
import {useEffect, useState} from "react";
import {GetVcResponse} from "@did-demo/common";
import {DeleteOutlined, ReloadOutlined} from "@ant-design/icons";
import {useAccount} from "wagmi";
import {VerifiableCredential} from "@veramo/core";
import {useMyApi} from "../myapi/MyApiProvider.tsx";
import toast from "../toast.ts";
import {useMyCrypto} from "../crypto/CryptoProvider.tsx";
import {useMyModal} from "../modal/ModalProvider.tsx";
import CreateVcRequestModal from "../modal/CreateVcRequestModal.tsx";
import VcRequestList from "../component/VcRequestList.tsx";
import VcDetailModal from "../modal/VcDetailModal.tsx";

function MyRequest() {
    const account = useAccount();
    const {crypto} = useMyCrypto();
    const createVcRequestModal = useMyModal(CreateVcRequestModal);
    const {api, isLogin, user} = useMyApi();
    const [loading, setLoading] = useState<boolean>(false);
    const [listData, setListData] = useState<GetVcResponse[]>([])
    const showVcModalFunc = useMyModal(VcDetailModal);

    useEffect(() => {
        loadData();
    }, [isLogin]);

    function loadData() {
        if (!isLogin) {
            toast.warn('Please login first')
            return;
        }
        setLoading(true);
        api.getMyRequestList(user).then((res) => {
            if (res.length == 0) {
                toast.info("No request found");
            }
            setListData(res);
            setLoading(false);
            console.log(res)
        }).catch((e) => {
            setLoading(false);
            toast.error(e.toString());
        })
    }

    function viewDetail(data: GetVcResponse) {
        if (!data.holderEncryptedVc && !data.signedVc) {
            toast.error('No valid data found')
            return;
        }
        let vcStr = '';
        try {
            if (data.signedVc) {
                if (data.publicKey) {
                    vcStr = crypto.decrypt(data.signedVc)
                } else {
                    vcStr = data.signedVc
                }
            } else {
                if (data.publicKey) {
                    vcStr = crypto.decrypt(data.holderEncryptedVc)
                } else {
                    vcStr = data.holderEncryptedVc
                }
            }
        } catch (e) {
            const error = e as Error;
            toast.error('Failed to decrypt vc: ' + error.toString())
            return;
        }

        try {
            const vc = JSON.parse(vcStr) as VerifiableCredential
            showVcModalFunc?.show({
                vc
            })
        } catch (e) {
            const error = e as Error;
            toast.error('Failed to parse vc: ' + error.toString())
        }

    }

    return (
        <Flex className='d-flex flex-column p-2'>
            <Flex className={'w-100 mb-2'}>
                <Button type={'primary'} onClick={() => {
                    createVcRequestModal?.show?.({});
                }}>
                    Create new request
                </Button>
                <Button className={'ms-2'} type={'default'} onClick={loadData}><ReloadOutlined/></Button>
            </Flex>
            <VcRequestList dataList={listData} isLoading={loading} renderActionList={(data: GetVcResponse) => {
                return [
                    <a onClick={() => viewDetail(data)} style={{color: '#3e77f8'}}>Detail</a>,
                    <a onClick={() => {
                        setTimeout(async () => {
                            toast('Deleting request')
                            try {
                                console.log('id: ' + data.id)
                                await api.deleteRequest(data.id)
                            } catch (e) {
                                const error = e as Error;
                                toast.error('Failed to delete request: ' + error.message)
                            }
                            loadData();
                        });
                    }}>
                        <Tooltip title={'Delete my Request'}>
                            <DeleteOutlined className={'fs-5'} style={{color: 'red'}}/>
                        </Tooltip>
                    </a>
                ];
            }}/>
        </Flex>
    )
}

function ReceivedRequest() {
    return (
        <>
        </>
    )
}

function MyKey() {
    const {isLogin, api, user} = useMyApi();
    const {createKeyPair, hasKey, pkHash, crypto} = useMyCrypto();
    const [enableCreateButton, setEnableCreateButton] = useState<boolean>(true);
    // const [key]

    useEffect(() => {
        if (!isLogin) return;
        if (!hasKey) {
            // api.getPk(user).then((pk) => {
            //     if(pk){
            //         saveKeyPair(user, pk, null)
            //     }
            // })
        }
    }, [isLogin, hasKey]);

    async function createAndUploadKey() {
        if (!isLogin) {
            toast.info('Please login first');
            return;
        }
        if (hasKey) {
            toast.info('You already have a key');
            if (!await api.getPk(user)) {
                toast.info('Retrying re-uploading')
                const pk = crypto.exportPk()
                await api.uploadPk(user, pk!)
            }
            return;
        }
        await createKeyPair();
        const pk = crypto.exportPk()
        if (!pk) {
            toast.error('Failed to create key pair')
            return
        }
        await api.uploadPk(user, pk)
    }

    return (
        <Flex className='d-flex flex-column w-100 m-2'>
            <Flex className={'w-100'}>
                <Button type={'primary'} onClick={() => {
                    setEnableCreateButton(false);
                    setTimeout(async () => {
                        try {
                            await createAndUploadKey()
                        } catch (e) {
                            const error = e as Error;
                            toast.error(error.message)
                        }
                        setEnableCreateButton(true);
                    })
                }} loading={!enableCreateButton}>Create and Upload Public Key</Button>
                <Button type={'default'} className={'ms-2'} disabled={true}>Recover your Key</Button>
            </Flex>
            <Card title={'Your Public Key Hash'} className={'mt-2'}>
                <Descriptions>
                    <Descriptions.Item>
                        {pkHash ? pkHash : 'No key'}
                    </Descriptions.Item>
                </Descriptions>
            </Card>

        </Flex>
    )
}

export function VcRequest() {

    const items: TabsProps['items'] = [{
        key: '1',
        label: 'My Requests',
        children: <MyRequest/>
    }, {
        key: '2',
        label: 'Received Requests',
        children: <ReceivedRequest/>
    }, {
        key: '3',
        label: 'Public Key',
        children: <MyKey/>
    }];
    return (
        <Tabs items={items} className={'w-100 ms-2 me-2'} centered={true}>

        </Tabs>
    )
}