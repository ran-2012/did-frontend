import {Button, Modal, QRCode} from "antd";

interface Param {
    show: boolean;
    onClose: () => void;
    qrString: string;
}

function QrCodeModal(param: Param) {
    return (
        <Modal
            closeIcon={null}
            width={'fit-content'}
            style={{height: 'fit-content'}}
            open={param.show}
            footer={(<Button onClick={param.onClose}>Close</Button>)}>
            <div className={'d-flex justify-content-center'}>
                <QRCode errorLevel={'L'} size={600}
                        style={{border: 'none'}}
                        value={param.qrString} type={'svg'}/>
            </div>
        </Modal>
    );
}

export default QrCodeModal;