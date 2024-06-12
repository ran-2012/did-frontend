import {Component} from "react";
import Field from "../component/field.tsx";

interface Param {

}

interface State {

}

class Mine extends Component<Param, State> {
    state: State = {}

    render() {
        return (
            <div className='h-100 w-100 d-flex'>
                <div className='m-auto'>
                    <Field x={10} y={10} mineCount={10}/>
                </div>
            </div>
        );
    }
}

export default Mine;