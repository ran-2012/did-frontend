import React, {useEffect, useState} from "react";
import {Button, Card, CardBody, CardHeader, CardText, InputGroup, ListGroup} from "react-bootstrap";
import Form from 'react-bootstrap/Form';

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
        if(param.list.length == 0) {
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

    function renderList() {
        return param.list.map((item, index) =>
            <ListGroup.Item className='d-flex' key={`item-${index}`}>
                <InputGroup className='m-1' style={{width: 'auto'}}>
                    <InputGroup.Text>{index + 1}</InputGroup.Text>

                </InputGroup>
                <InputGroup className='m-1 w-50'>
                    <InputGroup.Text>Key</InputGroup.Text>
                    <Form.Control type='text' name='key' defaultValue={item.key} disabled={!item.enabled}
                                  onChange={(e) => {
                                      param.list[index].key = e.target.value;
                                      param.onListUpdate(param.list);
                                  }}>
                    </Form.Control>
                </InputGroup>
                <InputGroup className='m-1 flex-grow-1'>
                    <InputGroup.Text>Value</InputGroup.Text>
                    <Form.Control type='text' name='value' defaultValue={item.value} disabled={!item.enabled}
                                  onChange={(e) => {
                                      param.list[index].value = e.target.value;
                                      param.onListUpdate(param.list);
                                  }}>
                    </Form.Control>
                </InputGroup>
            </ListGroup.Item>)
    }

    return (
        <Card className='m-2' style={{width: '60vw'}}>
            <CardHeader className='d-flex justify-content-between'>
                <div className='d-flex'>
                    <CardText className='m-auto fs-6'>Data fields</CardText>
                </div>
                <div className='d-flex justify-content-end'>
                    <Button className='me-2 font-monospace' size='sm' onClick={addItem}>
                        +
                    </Button>
                    <Button className='font-monospace' size='sm' onClick={removeItem}
                            disabled={!enableRemoveItemButton()}>
                        -
                    </Button>
                </div>
            </CardHeader>
            <CardBody>
                <ListGroup className='m-auto'>
                    {renderList()}
                </ListGroup>
            </CardBody>
        </Card>
    );
}

export default KeyValueList;
export {
    ItemParam
}