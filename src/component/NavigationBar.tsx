import React, {Component} from "react";
import {ConnectKitButton} from "connectkit";
import {Container, Navbar} from "react-bootstrap";

interface Param {

}

interface State {

}

class NavigationBar extends Component<Param, State> {
    state: State = {}

    render() {
        return (
            <Navbar expand='lg' className="p-3 bg-body-tertiary">
                <Container fluid>
                    <Navbar.Brand  href="#home">DID Demo APP</Navbar.Brand>
                    <div className='float-end'>
                        <ConnectKitButton theme="soft"/>
                    </div>
                </Container>
            </Navbar>
        );
    }
}

export default NavigationBar;
