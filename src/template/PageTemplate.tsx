import {useLoaderData} from 'react-router-dom'
import {Web3Provider} from "../component/Web3Provider.tsx";
import {Container} from "react-bootstrap";
import NavigationBar from "../component/NavigationBar.tsx";
import React, {ReactNode} from "react";

function PageTemplate() {
    const content = useLoaderData() as ReactNode;
    return (
        <Web3Provider>
            <div className='vh-100 d-flex flex-column'>
                <NavigationBar/>
                <Container className='flex-grow-1'>
                    {content}
                </Container>
            </div>
        </Web3Provider>
    );
}

export default PageTemplate;