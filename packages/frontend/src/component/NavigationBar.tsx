import React, {useRef, useState} from "react";
import {ConnectKitButton} from "connectkit";
import {Link, useNavigate} from "react-router-dom";
import {Button, Menu, Tooltip} from "antd";
import {ItemType} from "antd/es/menu/interface";
import {useAccount} from "wagmi";
import {useMyApi} from "../myapi/MyApiProvider.tsx";
import toast from "../toast.ts";

function NavigationBar() {
    const navigate = useNavigate();
    const account = useAccount();
    const {login, isLogin, logout} = useMyApi();
    const [current, setCurrent] = useState('sign');
    const linkMap = useRef(new Map<string, string>());
    const [menuItems] = useState<ItemType[]>(getItems());

    function getItems(): ItemType[] {
        const res: ItemType[] = [];

        function item(label: string, key: string, link: string = '', children: ItemType[] = []): ItemType {
            if (link) {
                linkMap.current.set(key, link);
            }

            return children.length > 0 ? ({
                label,
                key,
                children,
            }) : ({
                label,
                key,
                type: 'item'
            })
        }

        res.push(item('Sign', 'sign', '/'));
        res.push(item('My Data', 'my-data', '', [
            item('My Credentials', 'vc-list', '/vc-list'),
            item('My Presentations', 'vp-list', '/vp-list')
        ]));
        res.push(item('Credential Request', 'vc-request', '/vc-request'));
        // res.push(item('Mine', 'mine', '/mine'));
        // res.push(item('Test', 'test', '/test'));

        return res;
    }

    function getLink(key: string) {
        return linkMap.current.get(key) || '';
    }

    function getLoginArea() {
        if (!isLogin) {
            return (
                <Tooltip title={'Login to use Credential request/transfer functionality'}>
                    <Button
                        type={'link'}
                        style={{color: 'lightblue'}}
                        onClick={() => {
                            if (!account.isConnected) {
                                toast.error('Please connect your wallet first');
                                return;
                            }
                            login().then((res) => {
                                if (res) {
                                    toast.info('Login success');
                                } else {
                                    toast.error('Login failed');
                                }
                            }).catch((e) => {
                                toast.error('Login failed');
                                console.error(e);
                            });
                        }}>
                        Log in
                    </Button>
                </Tooltip>
            )
        } else {
            return (
                <Tooltip title={'Login to use Credential request/transfer functionality'}>
                    <Button
                        type={'link'}
                        style={{color: '#ef5656'}}
                        onClick={() => {
                            logout().then((res) => {
                                toast.info("Log out")
                            });
                        }}>
                        Log out
                    </Button>
                </Tooltip>
            )
        }
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
                items={menuItems}
                selectedKeys={[current]}
                onClick={(e) => {
                    console.log('click ', e);
                    setCurrent(e.key);
                    navigate(getLink(e.key));
                }}
            />
            <div className={'align-content-center'}>
                {getLoginArea()}
            </div>

            <div className='float-end align-content-center ms-2'>
                <ConnectKitButton mode='dark' theme="soft"/>
            </div>
        </>
    );
}

export default NavigationBar;
