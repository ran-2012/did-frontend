import React, {useEffect, useState} from "react";
import {Button, Card, CardBody, CardHeader, CardText, InputGroup, ListGroup} from "react-bootstrap";
import Form from 'react-bootstrap/Form';
import {useAccount} from "wagmi";

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
    onListUpdate: ((items: ItemParam[]) => void) | null;
}

function KeyValueList(param: Param) {
    const [list, setList] = useState<ItemParam[]>([])
    const account = useAccount();


    useEffect(() => {
        if (param.onListUpdate != null) {
            param.onListUpdate(list);
        }
    }, [list, param])

    if (account && list.length == 0) {
        setList([new ItemParam('key', 'value', false), new ItemParam('key', 'value')])
    }

    function addItem() {
        setList([...list, new ItemParam('', '')])
    }

    function removeItem() {
        if (list.length > 1) {
            setList(list.slice(0, list.length - 1))
        }
    }

    function enableRemoveItemButton() {
        return list.length > 1;
    }

    function renderList() {
        return list.map((item, index) =>
            <ListGroup.Item className='d-flex' key={`item-${index}`}>
                <InputGroup className='m-1' style={{width: 'auto'}}>
                    <InputGroup.Text>{index + 1}</InputGroup.Text>

                </InputGroup>
                <InputGroup className='m-1'>
                    <InputGroup.Text>Key</InputGroup.Text>
                    <Form.Control type='text' value={item.key} disabled={!item.enabled}
                                  onChange={(e) => {
                                      list[index].key = e.target.value;
                                  }}>
                    </Form.Control>
                </InputGroup>
                <InputGroup className='m-1'>
                    <InputGroup.Text>Value</InputGroup.Text>
                    <Form.Control type='text' value={item.value} disabled={!item.enabled}
                                  onChange={(e) => {
                                      list[index].value = e.target.value;
                                  }}>
                    </Form.Control>
                </InputGroup>
            </ListGroup.Item>)
    }

    return (
        <Card className='m-2' style={{width: 'fit-content'}}>
            <CardHeader className='d-flex justify-content-between'>
                <div className='d-flex'>
                    <CardText className='m-auto fs-6'>Data fields</CardText>
                </div>
                <div className='d-flex justify-content-end'>
                    <Button className='m-2 fs-5 font-monospace ' onClick={addItem}>
                        +
                    </Button>
                    <Button className='m-2 fs-5 font-monospace' onClick={removeItem}
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