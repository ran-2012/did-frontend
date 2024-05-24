import VcDetailModal from "../modal/VcDetailModal.tsx";
import {useState} from "react";
import {VerifiableCredential} from "@veramo/core";
import {Button} from "antd";

interface Param {

}


function getTestVc() {
    return JSON.parse(localStorage.getItem("VC-TEST") as string) as VerifiableCredential
}

function VcList(param: Param) {
    const [show, setShow] = useState(false);

    function showModal() {
        setShow(true)
    }

    function closeVcDetailModal() {
        console.log("close")
        setShow(false);
    }

    // BRIEF: ISSUER, DATE, TYPE
    // DETAIL: TYPE, SUBJECT, ISSUER, DATES, IS_VALID
    return (
        <div className='d-flex flex-column m-2'>
            <Button className='mb-2' onClick={showModal}>Toast</Button>
            <VcDetailModal vc={getTestVc()} title={'Verifiable Credential Detail'} show={show} onClose={closeVcDetailModal}/>
        </div>
    );
}

export default VcList;