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
            <center>
                <Field x={10} y={10} mineCount={10}/>
            </center>
        );
    }
}

export default Mine;