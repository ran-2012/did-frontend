/* eslint-disable no-unused-vars */
import {Spin, Tag, Tooltip} from "antd";
import React from "react";
import {VerifiableCredential} from "@veramo/core";
import {LoadingOutlined} from "@ant-design/icons";
import {VcUtility} from "./utility.ts";

export enum ValidState {
    Idle,
    Verifying,
    Valid,
    Invalid,
    NoProof,
    Unknown,
}

const VcUiUtility = {
    getIsExpired: (vc: VerifiableCredential) => {
        return VcUtility.getIsExpired(vc) ?
            (<Tag color={'blue'}>
                Not expired
            </Tag>) :
            (<Tag color={'red'}>
                Expired
            </Tag>)
    },
    getIsValid(isValid: ValidState, invalidReason: string) {
        switch (isValid) {
            case ValidState.Idle:
                return '';
            case ValidState.Valid:
                return (<Tag color={'blue'}>Valid</Tag>);
            case ValidState.Invalid:
                return (<Tooltip title={invalidReason}><Tag color={'red'}>Invalid</Tag></Tooltip>);
            case ValidState.Verifying:
                return (
                    <Tooltip title={'Verifying...'}>
                        <Spin indicator={<LoadingOutlined spin/>}/>
                    </Tooltip>
                );
            case ValidState.NoProof:
                return (
                    <Tooltip title={'No proof in this VC'}>
                        <Tag color={'red'}>No proof</Tag>
                    </Tooltip>
                )
            default:
                return (<Tag style={{color: 'gray'}}>Unknown</Tag>)
        }
    }
}

export {
    VcUiUtility
}