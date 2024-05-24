import {useLoaderData} from 'react-router-dom'
import {Web3Provider} from "../component/Web3Provider.tsx";
import NavigationBar from "../component/NavigationBar.tsx";
import React, {ReactNode} from "react";
import {Flex, Layout} from "antd";

function PageTemplate() {
    const content = useLoaderData() as ReactNode;
    return (
        <Web3Provider>
            <Layout style={{height: '100vh'}}>
                <Layout.Header className='d-flex flex-col'>
                    <NavigationBar/>
                </Layout.Header>
                <Layout.Content >
                    <Flex style={{
                        margin: '2em 2em 0 2em',
                        borderRadius: '1em',
                        height: 'calc(100% - 2em)',
                        justifyContent: 'center',
                        backgroundColor: 'white',
                        overflow: 'auto'
                    }}>
                        {content}
                    </Flex>
                </Layout.Content>
                <Layout.Footer style={{textAlign: 'right', marginLeft: '2em'}}>
                    DID Demo App By <a href={'https://github.com/ran-2012'}>Ran-2012</a>
                </Layout.Footer>
            </Layout>
        </Web3Provider>
    );
}

export default PageTemplate;