import KeyValueList, {ItemParam} from "../component/KeyValueList.tsx";
import {createTestCredential, getDid} from "../veramo/utility.ts";
import {useAccount} from "wagmi";
import toast from "../toast.ts";
import {useEffect, useState} from "react";
import {isSuccess} from "@blockchain-lab-um/masca-connector";
import {VerifiableCredential} from "@veramo/core";
import {Button, Flex} from "antd";
import VcDetailModal from "../modal/VcDetailModal.tsx";
import {useMasca} from "../masca/utility.ts";

function exampleItemList() {
    const result: ItemParam[] = []
    result.push(new ItemParam('id', 'did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101', false))
    result.push(new ItemParam('type', 'Regular User'))
    return result
}

function Index() {
    const [vc, setVc] = useState<VerifiableCredential | null>(null);
    const [isShowVcModal, setShowVcModal] = useState(false);
    const [itemList, setItemList] =
        useState<ItemParam[]>(exampleItemList())
    const account = useAccount();
    const masca = useMasca();
    const {isConnected} = account;

    useEffect(() => {
        console.log("account: " + account.address)
        if (itemList.length == 0) {
            setItemList([new ItemParam('id', getDid('ethr', account.address as string), false)]);
        } else {
            itemList[0].key = 'id';
            itemList[0].value = getDid('ethr', account.address as string);
            setItemList(itemList)
        }
    }, [account]);

    async function testSign() {
        console.log(JSON.stringify(itemList));
        try {
            console.log("mascaApi: " + masca.api)
            toast.info("Requesting signing")
            const res = await masca.api?.createCredential({
                minimalUnsignedCredential: createTestCredential(itemList)
            })

            if (res && isSuccess(res)) {
                const vc = res.data as VerifiableCredential;

                // TODO: delete saving to local storage
                localStorage.setItem("VC-TEST", JSON.stringify(vc))

                console.log(res.data);
                toast.success("Signing succeeded")

                setVc(vc);
                setShowVcModal(true);
            } else {
                toast.error("Failed to sign")
            }

        } catch (e) {
            console.log(e);
            toast.error("Failed to sign")
        }
    }

    return (
        <Flex className='flex-column w-100 align-content-center'>
            <div className={'m-auto'}>
                <Button type={'primary'} size={'large'} className={'mt-3'} onClick={testSign} disabled={!isConnected}>
                    Sign test
                </Button>
            </div>
            <div className='flex-grow-1 w-100 '>
                <KeyValueList list={itemList} onListUpdate={(newItems) => {
                    setItemList(newItems)
                }}/>
            </div>
            {vc && <VcDetailModal vc={vc} show={isShowVcModal} showSaveButton={true} onClose={() => {
                setShowVcModal(false)
            }}/>}
        </Flex>
    )
}

export default Index
