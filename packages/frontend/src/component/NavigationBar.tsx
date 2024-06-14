import React, {useRef, useState} from "react";
import {ConnectKitButton} from "connectkit";
import {Link, useNavigate} from "react-router-dom";
import {Menu, MenuProps} from "antd";
import {ItemType} from "antd/es/menu/interface";

function NavigationBar() {
    const navigate = useNavigate();
    const [current, setCurrent] = useState('sign');
    const linkMap = useRef(new Map<string, string>());
    const [menuItems, setMenuItems] = useState<ItemType[]>(getItems());

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
        res.push(item('Mine', 'mine', '/mine'));
        res.push(item('Test', 'test', '/test'));

        return res;
    }

    function getLink(key: string) {
        return linkMap.current.get(key) || '';
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
            <div className='float-end align-content-center'>
                <ConnectKitButton mode='dark' theme="soft"/>
            </div>
        </>
    );
}

export default NavigationBar;
