import {Button, Card, Descriptions, Flex, Tabs, Tooltip} from "antd";
import {useEffect, useRef, useState} from "react";
import {GetVcResponse, VcRequestStatus} from "@did-demo/common";
import {DeleteOutlined, ReloadOutlined} from "@ant-design/icons";
import {VerifiableCredential} from "@veramo/core";
import {isSuccess} from "@blockchain-lab-um/masca-connector";
import {useMyApi} from "../myapi/MyApiProvider.tsx";
import toast from "../toast.ts";
import {useMyCrypto} from "../crypto/CryptoProvider.tsx";
import {useMyModal} from "../modal/ModalProvider.tsx";
import CreateVcRequestModal from "../modal/CreateVcRequestModal.tsx";
import VcRequestList from "../component/VcRequestList.tsx";
import VcDetailModal from "../modal/VcDetailModal.tsx";
import JsonRawModal from "../modal/JsonRawModal.tsx";
import {useMasca, useMascaCallWrapper} from "../masca/utility.ts";
import {generatePkVc} from "../veramo/utility.ts";

function MyRequest() {
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

    function getFullText(data: GetVcResponse) {
        if (!data.holderEncryptedVc && !data.signedVc) {
            return '';
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
            return '';
        }
        return vcStr;
    }

    function viewDetail(data: GetVcResponse) {
        const vcStr = getFullText(data);
        if (!vcStr) {
            toast.error('No valid data found')
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
    const {crypto} = useMyCrypto();
    const {api, isLogin, user} = useMyApi();

    const masca = useMasca();
    const callWrapper = useMascaCallWrapper();

    const [loading, setLoading] = useState<boolean>(false);
    const [showAllData, setShowAllData] = useState<boolean>(false);
    const [listData, setListData] = useState<GetVcResponse[]>([])
    const [filteredData, setFilteredData] = useState<GetVcResponse[]>([]);

    const showVcModalFunc = useMyModal(VcDetailModal);
    const showFullTextFunc = useMyModal(JsonRawModal);

    useEffect(() => {
        loadData();
    }, [isLogin]);

    function loadData() {
        if (!isLogin) {
            toast.warn('Please login first')
            return;
        }
        setLoading(true);
        api.getReceivedRequestList(user).then((res) => {
            setListData(res);
            setFilteredData(res.filter((item) => {
                return item.status == VcRequestStatus.PENDING;
            }));

            setLoading(false);
            console.log(res)
        }).catch((e) => {
            setLoading(false);
            toast.error(e.toString());
        })
    }

    function getFullText(data: GetVcResponse) {
        if (!data.vc) {
            return '';
        }
        let vcStr = '';
        try {
            if (data.issuerPublicKey) {
                vcStr = crypto.decrypt(data.vc)
            } else {
                vcStr = data.vc
            }
        } catch (e) {
            const error = e as Error;
            toast.error('Failed to decrypt vc: ' + error.toString())
            return '';
        }
        return vcStr;
    }

    function viewDetail(data: GetVcResponse) {
        const vcStr = getFullText(data);
        if (!vcStr) {
            toast.error('No valid data found')
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

    function viewFullText(data: GetVcResponse) {
        const vcStr = JSON.stringify(JSON.parse(getFullText(data)), null, 4);
        showFullTextFunc?.show({json: vcStr});
    }

    function sign(data: GetVcResponse) {
        if (data.status != VcRequestStatus.PENDING) {
            toast.error('Only pending request can be signed')
            return;
        }
        setTimeout(async () => {
            const vcStr = getFullText(data);

            let vc: VerifiableCredential | null = null;
            try {
                vc = JSON.parse(vcStr) as VerifiableCredential
            } catch (e) {
                const error = e as Error;
                toast.error('Failed to parse vc: ' + error.toString())
                return;
            }

            // @ts-ignore
            vc.issuer = undefined;
            const result =
                await callWrapper.call(masca.api?.createCredential, {
                        infoMsg: 'Signing Verifiable Credential',
                        successMsg: 'Verifiable Credential signed successfully',
                        errorMsg: 'Failed to sign Verifiable Credential',
                    },
                    {
                        minimalUnsignedCredential: vc,
                        proofFormat: 'EthereumEip712Signature2021',
                        options: {
                            save: false,
                        }
                    });

            if (!isSuccess(result)) {
                return;
            }

            try {
                const vc = result.data;
                const vcStr = JSON.stringify(vc);

                if (!data.publicKey) {
                    toast.warn('No holder public key found, sending plaintext')
                    await api.uploadSignedVc(data.id, vcStr);
                } else {
                    const encryptedVc = crypto.encrypt(vcStr, data.publicKey);
                    await api.uploadSignedVc(data.id, encryptedVc)
                }

                loadData()
            } catch (e) {
                const error = e as Error;
                console.error(e);
                toast.error('Failed to encrypt/upload vc: ' + error.toString())
            }
        })
    }

    function reject(id: string) {
        toast.info('Rejecting request')
        setTimeout(async () => {
            try {
                await api.rejectRequest(id)
                toast.success('Request rejected')
            } catch (e) {
                const error = e as Error;
                toast.error('Failed to reject request: ' + error.message);
            }
        })
    }

    function revoke(id: string) {
        toast.info('Revoking credential')
        setTimeout(async () => {
            try {
                await api.revokeCredential(id)
                toast.success('Credential revoked')
            } catch (e) {
                const error = e as Error;
                toast.error('Failed to revoke credential: ' + error.message);
            }
        })
    }

    return (
        <Flex className='d-flex flex-column p-2'>
            <Flex className={'w-100 mb-2'}>
                <Button style={{}} type={'primary'} onClick={() => {
                    setShowAllData(!showAllData);
                }}>
                    {showAllData ? 'Show All Data' : 'Show Pending Data'}
                </Button>
                <Button className={'ms-2'} type={'default'} onClick={loadData}><ReloadOutlined/></Button>
            </Flex>
            <VcRequestList
                dataList={showAllData ? listData : filteredData}
                isLoading={loading}
                renderActionList={(data: GetVcResponse) => {
                    return [
                        <a onClick={() => viewDetail(data)} style={{color: '#3e77f8'}}>Detail</a>,
                        <a onClick={() => viewFullText(data)} style={{color: '#3e77f8'}}>Full Text</a>,
                        <a onClick={() => reject(data.id)} style={{color: '#d95858'}}>Reject</a>,
                        <a onClick={() => revoke(data.id)} style={{color: '#dabe65'}}>Revoke</a>,
                        <a onClick={() => sign(data)} style={{color: '#2aa917'}}>Sign</a>,
                    ];
                }}/>
        </Flex>
    )
}

function MyKey() {
    const masca = useMasca();
    const callWrapper = useMascaCallWrapper();

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

    async function requestPkVc(user: string, pk: string) {
        const vc = generatePkVc(user, pk);
        return await callWrapper.call(masca.api?.createCredential, {
            infoMsg: "Requesting signing",
            successMsg: "Credential signed",
            "errorMsg": "Failed to sign credential",
        }, {minimalUnsignedCredential: vc, proofFormat: "EthereumEip712Signature2021"});
    }

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
        const pkVcResult = await requestPkVc(user, pk);
        if (!pkVcResult.success) {
            console.error("Failed to generate public key vc")
            toast.error("Failed to generate public key vc")
            return;
        }
        await api.uploadPk(user, pk, pkVcResult.data)
    }

    return (
        <Flex className='d-flex flex-column w-100 m-2'>
            <Flex className={'w-100'}>
                <Button
                    type={'primary'}
                    loading={!enableCreateButton}
                    onClick={() => {
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
                    }}>
                    Create and Upload Public Key
                </Button>
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
    const realTabs = useRef([
        <MyRequest/>,
        <ReceivedRequest/>,
        <MyKey/>
    ])
    // Load only selected tab
    const [displayTabs, setDisplayTabs] = useState(
        [realTabs.current[0], <></>, <></>]);

    return (
        <Tabs
            items={[{
                key: '1',
                label: 'My Requests',
                children: displayTabs[0],
            }, {
                key: '2',
                label: 'Received Requests',
                children: displayTabs[1]
            }, {
                key: '3',
                label: 'Public Key',
                children: displayTabs[2]
            }]}
            onChange={(key) => {
                if (key == '1') {
                    setDisplayTabs([realTabs.current[0], <></>, <></>]);
                } else if (key == '2') {
                    setDisplayTabs([<></>, realTabs.current[1], <></>]);
                } else if (key == '3') {
                    setDisplayTabs([<></>, <></>, realTabs.current[2]]);
                }
            }}
            className={'w-100 ms-2 me-2'}
            centered={true}>

        </Tabs>
    )
}