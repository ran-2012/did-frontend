import React, {Component} from "react";
import {ConnectKitButton} from "connectkit";
import {Container, Navbar, Nav} from "react-bootstrap";
import {Link} from "react-router-dom";

interface Param {

}

interface State {
}

class NavigationBar extends Component<Param, State> {
    state: State = {}

    render() {
        return (
            <Navbar expand='lg' className="p-3 bg-body-tertiary">
                <Container>
                    <Navbar.Brand>
                        <Link to={'/'} style={{textDecoration: "none"}}>DID Demo APP</Link>
                    </Navbar.Brand>
                    <Nav className='me-auto'>
                        <Navbar.Text>
                            <Link to={`/mine`}>
                                Mine
                            </Link>
                        </Navbar.Text>
                    </Nav>
                    <div className='float-end'>
                        <ConnectKitButton theme="soft"/>
                    </div>
                </Container>
            </Navbar>
        );
    }
}

export default NavigationBar;
