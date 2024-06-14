import React, {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {ModalBaseParam} from "./type.ts";
import QrCodeModal from "./QrCodeModal.tsx";
import VcDetailModal from "./VcDetailModal.tsx";

interface Param {
    children: ReactNode,
}

export interface ModalFuncMap<Param extends ModalBaseParam, Component extends React.FC<Param>> {
    show: (param: Omit<React.ComponentProps<Component>, keyof ModalBaseParam>) => void;
}

export type MyModal = Map<React.FC<any>, ModalFuncMap<any, any>>

export const ModalContext = createContext<MyModal>(new Map())

function ModalProvider(param: Param) {
    const modalSet = useRef(new Set<React.FC<any>>());
    const [displayState, setDisplayState] = useState(new Map<string, boolean>());
    const [displayParam, setDisplayParam] = useState(new Map<string, ModalBaseParam>());
    const [modalFuncMap, setModalFuncMap] = useState<MyModal>(new Map());

    useEffect(() => {
        console.log("init modal provider")
        const _displayState = displayState;
        const _displayParam = displayParam;

        function addModal<Param extends ModalBaseParam>(Component: React.FC<Param>, param: Omit<React.ComponentProps<React.FC<Param>>, keyof ModalBaseParam>) {
            const name = Component.name;
            modalSet.current.add(Component);

            _displayState.set(name, false);
            _displayParam.set(name, {
                show: false,
                onClose: () => {
                    _displayState.set(name, false);
                    setDisplayState(_displayState);
                }, ...param
            });
        }

        // Add new Modal here
        addModal(QrCodeModal, {qrString: '123123123'})
        addModal(VcDetailModal, {
            title: 'VC',
        })

        // END

        setDisplayState(_displayState);
        setDisplayParam(_displayParam);

        const ret: MyModal = new Map;
        for (const modal of modalSet.current) {
            ret.set(modal, {
                // @ts-ignore
                show: (param: ModalBaseParam) => {
                    setDisplayState(new Map(displayState.set(modal.name, true)));
                }
            });
        }
        setModalFuncMap(ret)
    }, []);


    function getModalList() {
        const list: React.FC<ModalBaseParam>[] = Array.from(modalSet.current);

        return list.map((Component, index) => {

            const name = Component.name;
            const param = Object.assign(displayParam.get(name)!, {show: displayState.get(name)!})
            return <Component key={`key-${name}`} {...param}/>
        })
    }

    return (
        <ModalContext.Provider value={modalFuncMap}>
            {param.children}
            {getModalList()}
        </ModalContext.Provider>
    );
}

export function useMyModal<Param extends ModalBaseParam>(c: React.FC<Param>): ModalFuncMap<Param, React.FC<Param>> | null {
    return useContext(ModalContext).get(c) ?? null;
}

export default ModalProvider;