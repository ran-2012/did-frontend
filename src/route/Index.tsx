import {config} from "../wagmi/config.ts";

import 'bootstrap/dist/css/bootstrap.min.css';
import {Button} from "react-bootstrap";
import {signMessage} from '@wagmi/core'

function Index() {

    async function testSign() {
        try {
            const res = await signMessage(config, {
                message: "test message"
            })
            console.log(res)

        } catch (e) {
            console.log(e);
        }
    }

    return (
        <center>
            <Button className='m-1' onClick={testSign}>
                Sign test
            </Button>
            <div className="card">
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>
        </center>
    )
}

export default Index
