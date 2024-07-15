import { SingleBase } from "../util/single_base";
import { BaseMsgInfo, decodeBaseMsgInfo } from "./protobuf/base";
import { NetMsgContainer, NetMsgID } from "./protobuf/message/net_message_container";

class NetMgr extends SingleBase<NetMgr>
{
    private _IsConnected: boolean = false;
    private _Socket: WebSocket = null;

    private _RequestNum: number = 0;
    private _RequestCallbackCache: Map<number, number> = new Map<number, number>();

    public get IsConnected(): boolean
    {
        return this._IsConnected;
    }

    private Connect(ip: string, port: number): void
    {
        // 使用websocket连接服务器
        this._Socket = new WebSocket(`ws://${ip}:${port}`);
        this._Socket.onopen = this.OnOpen.bind(this);
        this._Socket.onmessage = this.OnMessage.bind(this);
        this._Socket.onclose = this.OnClose.bind(this);
        this._Socket.onerror = this.OnError.bind(this);
    }

    private OnOpen(event: Event): void
    {
        this._IsConnected = true;
    }

    private OnMessage(event: MessageEvent): void
    {
        let data = new Uint8Array(event.data);
        let BaseMsg: BaseMsgInfo = decodeBaseMsgInfo(data);
        if(BaseMsg.NeedReplay)
        {
            let msgID = this._RequestCallbackCache.get(BaseMsg.MsgID);
            if(msgID != null)
            {
                this._RequestCallbackCache.delete(BaseMsg.MsgID);
            }
        }
        // TODO: 处理网络消息
    }

    private OnClose(event: CloseEvent): void
    {
        // TODO: 处理网络关闭
    }

    private OnError(event: Event): void
    {
        // TODO： 处理网络错误
    }

    protected OnInit(): void
    {
        // TODO: 使用正确ip和port
        this.Connect("127.0.0.1", 8080);
    }

    protected OnRelease(): void
    {
        if(this.IsConnected)
        {
            this._Socket.close();
            this._Socket = null;
        }
    }

    private GenMsgID(): number
    {
        return ++this._RequestNum;
    }

    // 直接push，不等返回
    Push(msgID: number, msg: any): void
    {
        if(this.IsConnected)
        {
            let data = NetMsgContainer.encodeMsg(msgID, msg);
            if(data == null)
            {
                console.error("SendMsg: ", msgID, msg);
                return;
            }
            
            let BaseMsg: BaseMsgInfo = 
            {
                MsgID: msgID,
                Data: data,
                NeedReplay: false,
            };

            let sendData = NetMsgContainer.encodeMsg(NetMsgID.BaseMsgInfo, BaseMsg);
            if(sendData == null)
            {
                console.error("SendMsg: ", msgID, msg);
                return;
            }
            this._Socket.send(sendData);
        }
    }

    // 异步请求，等待返回
    *SyncRequest(msgEnum: number, msg: any， timeout: number = 5000): Generator<number, any, any>
    {
        if(this.IsConnected)
        {
            let data = NetMsgContainer.encodeMsg(msgEnum, msg);
            if(data == null)
            {
                console.error("SendMsg: ", msgEnum, msg);
                return;
            }
            let mID = this.GenMsgID();
            let BaseMsg: BaseMsgInfo = 
            {
                ID: msgEnum,
                Data: data,
                NeedReplay: true,
                MsgID: mID,
            };

            let sendData = NetMsgContainer.encodeMsg(NetMsgID.BaseMsgInfo, BaseMsg);
            if(sendData == null)
            {
                console.error("SendMsg: ", msgEnum, msg);
                return;
            }
            this._Socket.send(sendData);
            this._RequestCallbackCache.set(mID, msgEnum);
        }
    }

}