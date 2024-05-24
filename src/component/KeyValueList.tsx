import React, {useEffect} from "react";
import Form from 'react-bootstrap/Form';
import {Button, Card, Input, Table, TableProps} from "antd";

enum ItemType {

}

class ItemParam {
    key: string;
    value: string;
    enabled: boolean;
    selected: boolean;
    type: ItemType | null;

    constructor(key: string, value: string, enable: boolean = true, selected: boolean = true, type: ItemType | null = null) {
        this.key = key;
        this.value = value;
        this.enabled = enable;
        this.selected = selected;
        this.type = type;
    }
}

interface Param {
    list: ItemParam[];
    onListUpdate: ((items: ItemParam[]) => void);
}

function KeyValueList(param: Param) {

    useEffect(() => {
        if (param.list.length == 0) {
            param.onListUpdate([new ItemParam('', '')])
        }
    }, [param])

    function addItem() {
        if (param.onListUpdate) {
            param.onListUpdate([...param.list, new ItemParam('', '')])
        }
    }

    function removeItem() {
        if (param.list.length > 1) {
            if (param.onListUpdate) {
                param.onListUpdate(param.list.slice(0, param.list.length - 1))
            }
        }
    }

    function enableRemoveItemButton() {
        return param.list.length > 1;
    }

    function getColumn(): TableProps<ItemParam>['columns'] {
        return [
            {
                title: 'Id',
                key: 'key',
                render: (_, __, index) => {
                    return index;
                },
            },
            {
                title: 'Key',
                key: 'key',
                render: (_, item, index: number) => {
                    return (
                        <Input disabled={!item.enabled} defaultValue={item.key} onChange={(e) => {
                            param.list[index].key = e.target.value;
                            param.onListUpdate(param.list);
                        }}></Input>
                    )
                },
                width: 150
            },
            {
                title: 'Value',
                key: 'value',
                render: (_, item, index: number) => {
                    return (
                        <Input disabled={!item.enabled} defaultValue={item.value} onChange={(e) => {
                            param.list[index].value = e.target.value;
                            param.onListUpdate(param.list);
                        }}></Input>
                    )
                }
            },
        ]
    }

    return (
        <Card className='m-2' style={{width: '60vw'}} title={'Data fields'} extra={
            <div className='d-flex justify-content-end'>
                <Button className='me-2 font-monospace' type={'primary'} onClick={addItem} icon={'+'}/>
                <Button className='font-monospace' type={'primary'} onClick={removeItem}
                        disabled={!enableRemoveItemButton()} icon={'-'}/>
            </div>}>
            <Table columns={getColumn()} dataSource={param.list} pagination={false} rowKey={'id'}/>
        </Card>
    );
}

export default KeyValueList;
export {
    ItemParam
}