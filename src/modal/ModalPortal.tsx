import {Component, ReactNode} from "react";
import {Modal} from "react-bootstrap";
import {createPortal} from "react-dom";

interface Param {
    children: ReactNode
}


function ModalPortal(param: Param) {

    function createModal() {
        return createPortal(param.children, document.body)
    }

    return (
        <>
            {createModal()}
        </>
    )
}

export default ModalPortal;