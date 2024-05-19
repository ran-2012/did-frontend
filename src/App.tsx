import Field from "./component/field.tsx";
import {Web3Provider} from "./component/Web3Provider.tsx";
import NavigationBar from "./component/NavigationBar.tsx";
import 'bootstrap/dist/css/bootstrap.min.css';
import {Button} from "react-bootstrap";
import {signMessage} from '@wagmi/core'
import {config} from "./wagmi/config.ts";

function App() {

    async function testSign() {
        try{
            const res = await signMessage(config, {
                message: "test message"
            })
            console.log(res)

        }catch (e){
            console.log(e);
        }
    }

    return <Web3Provider>
        <NavigationBar>

        </NavigationBar>

        <Button className='m-1' onClick={testSign}>
            Sign test
        </Button>
        <div className="card">
            <p>
                Edit <code>src/App.tsx</code> and save to test HMR
            </p>
        </div>

        <Field x={10} y={10} mineCount={10}/>
    </Web3Provider>
}

export default App
