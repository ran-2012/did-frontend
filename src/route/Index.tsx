import {Button} from "react-bootstrap";
import KeyValueList, {ItemParam} from "../component/KeyValueList.tsx";
import {convertKvList, createTestCredential, getDid} from "../veramo/utility.ts";
import {useAccount, useSignMessage} from "wagmi";
import {useMasca} from "../masca/utility.ts";
import toast from "../toast.ts";
import {useEffect, useState} from "react";
import {isSuccess} from "@blockchain-lab-um/masca-connector";

function exampleItemList() {
    const result: ItemParam[] = []
    result.push(new ItemParam('id', 'did:ethr:0xaa36a7:0x0fdf03d766559816e67b29df9de663ae1a6e6101', false))
    result.push(new ItemParam('type', 'Regular User'))
    return result
}

function Index() {
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
            const vc = await masca.api?.createCredential({
                minimalUnsignedCredential: createTestCredential(itemList)
            })

            if (vc && isSuccess(vc)) {
                console.log(vc.data);
                toast.success("Signing succeeded")
            } else {
                toast.error("Failed to sign")
            }

        } catch (e) {
            console.log(e);
            toast.error("Failed to sign")
        }
    }

    function onItemListChange() {
        setItemList(itemList)
    }

    function toastTest() {
        toast('Toast test')
    }

    return (
        <div className='d-flex flex-column m-2'>
            <Button className='mb-2 m-auto' onClick={toastTest}>Toast</Button>
            <Button className=' m-auto' onClick={testSign} disabled={!isConnected}>
                Sign test
            </Button>
            <div className='flex-grow-1 m-auto'>
                <KeyValueList list={itemList} onListUpdate={(newItems) => {
                    setItemList(newItems)
                }}/>
            </div>
        </div>
    )
}

export default Index
