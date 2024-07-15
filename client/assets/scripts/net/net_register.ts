import { SingleBase } from "../util/single_base";
import { NetMsgID } from "./protobuf/message/net_message_container";

export class NetRegister extends SingleBase<NetRegister> 
{
   private _RegisterMap: Map<NetMsgID, (message: any)=>void> = new Map<NetMsgID, (message: any)=>void>();

   protected OnInit(): void 
   {
       
   }

    protected OnRelease(): void 
    {
         
    }

    public Register(id: NetMsgID, callback:(message: any)=>void): void
    {
        if(this._RegisterMap.has(id))
        {
            console.error("NetRegister Register Error: id has been registered");
            return;
        }
        this._RegisterMap.set(id, callback);
    }

    public get GetFuncByID(): Map<NetMsgID, (message: any)=>void>
    {
        return this._RegisterMap;
    }

    public UnRegister(id: NetMsgID): void
    {
        this._RegisterMap.delete(id);
    }
}