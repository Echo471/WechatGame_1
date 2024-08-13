import { encodeBaseMsg, decodeBaseMsg } from "./proto/base";
import { encodeLoginRequest, decodeLoginRequest, encodeLoginReplay, decodeLoginReplay } from "./proto/login";

interface ProtoInfos
{
    EncodeFunc: (msg: any) => Uint8Array;
    DecodeFunc: (data: Uint8Array) => any;
}


export enum NetMsgID
{
    CLSID_BaseMsgID = 0,
    CLSID_LoginInfo       = 1,
    CLSID_LoginRet        = 2,
}

export class NetMsgContainer 
{
    private static ProtoID2Map: Map<number, ProtoInfos> = new Map<number, ProtoInfos>([
        [NetMsgID.CLSID_BaseMsgID, { EncodeFunc: encodeBaseMsg, DecodeFunc: decodeBaseMsg }],
        [NetMsgID.CLSID_LoginInfo, { EncodeFunc: encodeLoginRequest, DecodeFunc: decodeLoginRequest }],
        [NetMsgID.CLSID_LoginRet, { EncodeFunc: encodeLoginReplay, DecodeFunc: decodeLoginReplay }],
    ]);

    public static encodeMsg(msgID: number, msg: any): Uint8Array | null
    {
        let protoFuncs = NetMsgContainer.ProtoID2Map.get(msgID);
        if (protoFuncs != null) {
            return protoFuncs.EncodeFunc(msg);
        }
        return null;
    }

    public static decodeMsg(msgID: number, data: Uint8Array): any 
    {
        let protoFuncs = NetMsgContainer.ProtoID2Map.get(msgID);
        if (protoFuncs != null) {
            return protoFuncs.DecodeFunc(data);
        }
        return null;
    }


}
