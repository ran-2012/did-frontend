import {toast} from 'react-toastify'
import {Button} from "react-bootstrap";
import KeyValueList, {ItemParam} from "../component/KeyValueList.tsx";
import {convertKvList, createTestCredential} from "../veramo/utility.ts";
import {useAccount, useSignMessage} from "wagmi";
import {useMascaApi} from "../masca/utility.ts";

function Index() {
    const account = useAccount();
    const mascaApi = useMascaApi();
    const {isConnected} = account;

    let items: ItemParam[] = [];

    async function testSign() {
        console.log(account);
        const obj = convertKvList(items);
        console.log(JSON.stringify(obj));
        try {
            console.log("mascaApi: " + mascaApi)
            await mascaApi?.createCredential({
                minimalUnsignedCredential: createTestCredential()
            })
        } catch (e) {
            console.log(e);
        }
    }

    function toastTest() {
        toast('Toast test')
    }

    return (
        <div className='d-flex flex-column m-2'>
            <Button className='m-auto' onClick={toastTest}>Toast</Button>
            <Button className='m-auto' onClick={testSign} disabled={!isConnected}>
                Sign test
            </Button>
            <div className='flex-grow-1 m-auto'>
                <KeyValueList onListUpdate={(newItems) => {
                    items = newItems
                }}/>

            </div>
        </div>
    )
}

export default Index
