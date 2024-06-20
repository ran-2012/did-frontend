import React, {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {ModalBaseParam} from "./type.ts";
import QrCodeModal from "./QrCodeModal.tsx";
import VcDetailModal from "./VcDetailModal.tsx";
import CreateVcRequestModal from "./CreateVcRequestModal.tsx";
import JsonRawModal from "./JsonRawModal.tsx";

interface Param {
    children: ReactNode,
}

export interface ModalFuncMap<Param extends ModalBaseParam, Component extends React.FC<Param>> {
    show: (param: Omit<React.ComponentProps<Component>, keyof ModalBaseParam>) => void;
}

export type MyModal = Map<React.FC<unknown>, ModalFuncMap<ModalBaseParam, React.FC<ModalBaseParam>>>

export const ModalContext = createContext<MyModal>(new Map())

function ModalProvider(param: Param) {
    const modalSet = useRef(new Set<React.FC<unknown>>());
    const [displayState, setDisplayState] = useState(new Map<string, boolean>());
    const [displayParam, setDisplayParam] = useState(new Map<string, ModalBaseParam>());
    const [modalFuncMap, setModalFuncMap] = useState<MyModal>(new Map());

    useEffect(() => {
        console.log("init modal provider")
        modalSet.current = new Set();
        const _displayState = displayState;
        const _displayParam = displayParam;
        const _modalFuncMap: MyModal = new Map();


        function addModal<Param extends ModalBaseParam>(Component: React.FC<Param>, param: Omit<React.ComponentProps<React.FC<Param>>, keyof ModalBaseParam>) {
            const name = Component.name;
            modalSet.current.add(Component as React.FC<unknown>);

            _displayState.set(name, false);
            _displayParam.set(name, {
                show: false,
                onClose: () => {
                    _displayState.set(name, false);
                    setDisplayState(new Map(_displayState));
                }, ...param
            });
            _modalFuncMap.set(Component as React.FC<unknown>, {
                // @ts-ignore
                show: (param: Omit<Param, keyof ModalBaseParam>) => {
                    console.log("show, param:" + JSON.stringify(param));
                    const previousValue = _displayParam.get(name)!;

                    _displayState.set(name, true);
                    _displayParam.set(name, Object.assign(previousValue, param));

                    setDisplayState(new Map(_displayState));
                    setDisplayParam(new Map(_displayParam));
                }
            });
        }

        console.log('size: ' + modalSet.current.size);
        // Add new Modal here
        addModal(QrCodeModal, {qrString: '123123123'})
        addModal(VcDetailModal, {
            title: 'VC',
        })
        addModal(CreateVcRequestModal, {initSubjectList: []});
        addModal(JsonRawModal, {json: '{}'});

        // END

        setDisplayState(_displayState);
        setDisplayParam(_displayParam);
        setModalFuncMap(_modalFuncMap)
    }, []);


    function getModalList() {
        const list: React.FC<ModalBaseParam>[] = Array.from(modalSet.current);

        return list.map((Component, index) => {
            const name = Component.name;
            return <Component key={`key-${name}`} {...displayParam.get(name)!} show={displayState.get(name)!}/>
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
    return useContext(ModalContext).get(c as React.FC<unknown>) ?? null;
}

export default ModalProvider;