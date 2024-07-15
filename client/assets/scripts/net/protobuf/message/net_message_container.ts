import { encodeBaseMsgInfo, decodeBaseMsgInfo } from "./proto/base";
import { encodeLoginInfo, decodeLoginInfo } from "./proto/base";

interface ProtoFuncs
{
    EncodeFunc: (msg: any) => Uint8Array;
    DecodeFunc: (data: Uint8Array) => any;
}

export class NetMsgContainer 
{
    private static ProtoID2Map: Map<number, ProtoFuncs> = new Map<number, ProtoFuncs>([
        [1, { EncodeFunc: encodeBaseMsgInfo, DecodeFunc: decodeBaseMsgInfo }],
        [2, { EncodeFunc: encodeLoginInfo, DecodeFunc: decodeLoginInfo }],
    ]);

    public static encodeMsg(msgID: number, msg: any): Uint8Array 
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

export enum NetMsgID
{
    BaseMsgInfo     = 1,
    LoginInfo       = 2,
}
