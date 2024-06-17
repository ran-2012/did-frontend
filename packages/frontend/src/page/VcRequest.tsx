import {Button, Card, Descriptions, Flex, List, Tabs, TabsProps} from "antd";
import {useEffect, useState} from "react";
import {GetVcResponse} from "@did-demo/common";
import {ReloadOutlined} from "@ant-design/icons";
import {useAccount} from "wagmi";
import {useMyApi} from "../myapi/MyApiProvider.tsx";
import toast from "../toast.ts";
import {useMyCrypto} from "../crypto/CryptoProvider.tsx";
import {useMyModal} from "../modal/ModalProvider.tsx";
import CreateVcRequestModal from "../modal/CreateVcRequestModal.tsx";
import {getDid} from "../veramo/utility.ts";

function MyRequest() {
    const account = useAccount();
    const createVcRequestModal = useMyModal(CreateVcRequestModal);
    const {api, isLogin, user} = useMyApi();
    const [listData, setListData] = useState<GetVcResponse[]>([])

    useEffect(() => {
        if (isLogin && user) {
            loadData();
        }
    }, [isLogin, user]);

    function loadData() {
        api.getMyRequestList(user).then((res) => {
            if (res.length == 0) {
                toast.info("No request found");
            }
            setListData(res);
            console.log(JSON.stringify(res));
        }).catch((e) => {
            toast.error(e.toString());
        })
    }

    return (
        <Flex className='d-flex flex-column w-100 m-2'>
            <Flex className={'w-100'}>
                <Button type={'primary'} onClick={() => {
                    createVcRequestModal?.show?.({});
                }}>
                    Create new request
                </Button>
                <Button className={'ms-2'} type={'default'} onClick={loadData}><ReloadOutlined/></Button>

            </Flex>
            <List>

            </List>
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