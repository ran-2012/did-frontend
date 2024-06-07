import {Button, Input, Modal} from "antd";
import React from "react";
import * as FileSaver from "file-saver";

interface Param {
    show: boolean;
    title?: string;
    json: string;
    onClose: () => void;
}

function JsonRawModal(param: Param) {
    return (
        <Modal
            open={param.show}
            width={'80%'}
            style={{maxWidth: '1200px'}}
            title={param.title ? param.title : 'Credential Full Text'}
            onCancel={() => param.onClose()}
            footer={<>
                <Button type={'default'}
                        onClick={() => {
                            const file = new Blob([param.json], {type: 'application/json'})
                            FileSaver.saveAs(file, `${param.title ?? 'credential'}.json`)
                        }}>Save</Button>
                <Button type={'primary'} onClick={() => param.onClose()}>Close</Button>
            </>}>
            <Input.TextArea
                className={'font-monospace overflow-scroll text-nowrap'}
                value={param.json}
                autoSize={{minRows: 10, maxRows: 20}}>

            </Input.TextArea>
        </Modal>
    );
}

export default JsonRawModal;