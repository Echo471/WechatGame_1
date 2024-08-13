import { _decorator, Button, Component, Node } from 'cc';
import { NetMgr } from '../net/net_mgr';
import { NetMsgID } from '../net/protobuf/message/net_message_container';
import { LoginRequest } from '../net/protobuf/message/proto/login';
import { Long } from '../base_lib/math/long';
import { Log } from '../base_lib/log_helper';


const { ccclass, property } = _decorator;

@ccclass('test_websocket')
export class test_websocket extends Component {

    @property({ type: Button })
    public Btn_SendMsgTest = null;

    start() {
        this.Btn_SendMsgTest.node.on(Button.EventType.CLICK, this.OnBtn_SendMsgTest.bind(this));
    }

    update(deltaTime: number) {
        
    }

    public OnBtn_SendMsgTest(){
        let loginInfo: LoginRequest = {
            UserID: Long.FromNumber(10000),
        }
        NetMgr.GetInstance(NetMgr).Push(NetMsgID.CLSID_LoginInfo, loginInfo)
    }
}


