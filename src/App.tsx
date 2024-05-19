import {useState} from 'react'
import './App.css'
import Field from "./component/field.tsx";

function App() {
    const [count, setCount] = useState(0)

    return (
        <div>
            <div className="card">
                <button onClick={() => setCount((count) => count + 1)}
                       >
                    count is {count} !!
                </button>
                <p>
                    Edit <code>src/App.tsx</code> and save to test HMR
                </p>
            </div>

            <Field x={10} y={10} mineCount={10}/>
        </div>
    )
}

export default App
