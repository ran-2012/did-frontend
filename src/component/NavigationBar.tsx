import React from "react";
import {ConnectKitButton} from "connectkit";
import {Container, Navbar, Nav} from "react-bootstrap";
import {Link} from "react-router-dom";

function NavigationBar() {
    return (
        <Navbar expand='lg' className="p-3 bg-body-tertiary">
            <Container className={'d-flex'}>
                <div className={'d-flex float-start'}>
                    <Navbar.Brand className={'m-2'}>
                        <Link to={'/'} style={{textDecoration: "none"}}>DID Demo APP</Link>
                    </Navbar.Brand>
                    <Nav  className={'m-2'}>
                        <Navbar.Text>
                            <Link to={`/vc-list`}>
                                My VC
                            </Link>
                        </Navbar.Text>
                    </Nav>
                    <Nav  className={'m-2'}>
                        <Navbar.Text>
                            <Link to={`/mine`}>
                                Mine
                            </Link>
                        </Navbar.Text>
                    </Nav>
                </div>
                <div className='float-end'>
                    <ConnectKitButton theme="soft"/>
                </div>
            </Container>
        </Navbar>
    );
}

export default NavigationBar;
