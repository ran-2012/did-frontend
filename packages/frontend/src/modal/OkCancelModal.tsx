import {Component, ReactNode} from "react";
import {Button, Modal} from "antd";

interface Param {
    show: boolean;
    title?: string;
    message: string | ReactNode;
    onOk?: () => void;
    onCancel?: () => void;
}


function OkCancelModal(param: Param) {

    return (
        <Modal
            open={param.show}
            title={param.title ? param.title : null}
            onOk={() => param.onOk?.()}
            onCancel={() => param.onCancel?.()}
            footer={(_, {}) => {
                return (
                    <>
                        <Button type={'primary'} onClick={param.onOk}>OK</Button>
                        <Button type={'default'} onClick={param.onCancel}>Cancel</Button>
                    </>
                )
            }}>
            {param.message}
        </Modal>
    );
}

export default OkCancelModal;