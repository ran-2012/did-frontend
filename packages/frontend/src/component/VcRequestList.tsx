import {Checkbox, Flex, List, Space, Tag, Tooltip} from "antd";
import {GetVcResponse, VcRequestStatus} from "@did-demo/common";
import {QrcodeOutlined} from "@ant-design/icons";
import {ReactNode} from "react";
import {formatDid, formatDidFromAddress, getDid} from "../veramo/utility.ts";
import {useMyCrypto} from "../crypto/CryptoProvider.tsx";

interface Param {
    dataList: GetVcResponse[];
    isLoading?: boolean;
    renderActionList?: (data: GetVcResponse) => ReactNode[],
}

function VcRequestList(param: Param) {
    const {crypto} = useMyCrypto();

    function getStatusTag(data: GetVcResponse) {
        switch (data.status) {
            case VcRequestStatus.PENDING: {
                return (<Tag color={'blue'}>Processing</Tag>);
            }
            case VcRequestStatus.SIGNED: {
                return (<Tag color={'green'}>Signed</Tag>);
            }
            case VcRequestStatus.REJECTED: {
                return (<Tag color={'red'}>Rejected</Tag>)
            }
            default: {
                return (<Tag color={'gray'}>Unknown</Tag>);
            }

        }
    }

    function getRevokeStatue(data: GetVcResponse) {
        if (data.isRevoked) {
            return (<Tag color={'red'}>Revoked</Tag>)
        }
        return (<></>);
    }

    return (
        <List
            bordered
            className={'flex-grow-1'}
            dataSource={param.dataList}
            loading={param.isLoading ?? false}
            renderItem={(data, index) => (
                <Flex className={'hover'}
                      style={{borderBottom: '1px solid lightgray'}}>
                    <List.Item
                        className={'flex-grow-1'}
                        key={index}
                        actions={[
                            ...(param.renderActionList?.(data) ?? [])
                        ]}>

                        <div className={'fs-5 me-5'}>{index + 1}</div>
                        <Space className={'flex-grow-1'} size={'large'}>
                            <Space className={'font-monospace'} direction={'vertical'}>
                                <div>
                                    Issuer: <Tooltip
                                    title={getDid(data.issuer)}><span>{formatDidFromAddress(data.issuer)}</span></Tooltip>
                                </div>
                                <div>
                                    Holder: <Tooltip
                                    title={getDid(data.holder)}><span>{formatDidFromAddress(data.holder)}</span></Tooltip>
                                </div>
                            </Space>
                            {getStatusTag(data)}
                            {getRevokeStatue(data)}
                            <Tooltip title={crypto.sha256(data.vc)}><Tag>Hash</Tag></Tooltip>
                        </Space>
                    </List.Item>
                </Flex>
            )}></List>);
}

export default VcRequestList;