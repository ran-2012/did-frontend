import {useLoaderData} from 'react-router-dom'
import React, {ReactNode} from "react";
import {Flex, Layout} from "antd";
import {Web3Provider} from "../component/Web3Provider.tsx";
import NavigationBar from "../component/NavigationBar.tsx";
import {CryptoProvider} from "../crypto/CryptoProvider.tsx";
import MyApiProvider from "../myapi/MyApiProvider.tsx";
import ModalProvider from "../modal/ModalProvider.tsx";

function PageTemplate() {
    const content = useLoaderData() as ReactNode;
    return (
        <Web3Provider>
            <CryptoProvider>
                <MyApiProvider>
                    <ModalProvider>
                        <Layout className={'vh-100'}>
                            <Layout.Header className='d-flex flex-col'>
                                <NavigationBar/>
                            </Layout.Header>
                            <Layout.Content>
                                <Flex style={{
                                    margin: '1em 1em 0em',
                                    height: 'calc(100% - 1em)',
                                    justifyContent: 'center',
                                }}>
                                    <Flex style={{
                                        borderRadius: '1em',
                                        height: '100%',
                                        justifySelf: 'center',
                                        maxWidth: '1200px',
                                        width: '100%',
                                        justifyContent: 'center',
                                        backgroundColor: 'white',
                                        overflow: 'auto'
                                    }}>
                                        {content}
                                    </Flex>
                                </Flex>
                            </Layout.Content>
                            <Layout.Footer style={{textAlign: 'right', marginLeft: '2em'}}>
                                DID Demo App By <a href={'https://github.com/ran-2012'}>Ran-2012</a>
                            </Layout.Footer>
                        </Layout>
                    </ModalProvider>
                </MyApiProvider>
            </CryptoProvider>
        </Web3Provider>
    );
}

export default PageTemplate;