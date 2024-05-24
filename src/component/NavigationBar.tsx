import React from "react";
import {ConnectKitButton} from "connectkit";
import {Link} from "react-router-dom";
import {Menu} from "antd";

function NavigationBar() {

    function getItems() {
        const res: any[] = [];

        function addItem(label: string, key: string, link: string) {
            res.push({
                label: (<Link to={link}>{label}</Link>),
                key: key,
            })
        }

        addItem('Sign', 'sign', '/');
        addItem('My VC', 'vc-list', '/vc-list');
        addItem('Mine', 'mine', '/mine');
        return res;
    }

    return (
        <>
            <div className='text-lg-start text-white fs-4 me-3'>
                <Link to={'/'} style={{textDecoration: 'none'}}>DID Demo</Link>
            </div>
            <Menu
                theme={'dark'}
                style={{flex: 1}}
                mode={'horizontal'}
                items={getItems()}>
            </Menu>
            <div className='float-end align-content-center'>
                <ConnectKitButton mode='dark' theme="soft"/>
            </div>
        </>
    );
}

export default NavigationBar;
