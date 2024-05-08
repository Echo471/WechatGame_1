import { _decorator, Component, Node } from 'cc';
import { SingleBase } from '../../util/single_base';
import { GameMgr } from '../../game_mgr';
import './message/proto/test';
import './message/proto/test';
import './message/proto/test';
const { ccclass, property } = _decorator;


interface ProtobufMessage<T> {
    deserializeBinary: (data: Uint8Array) => T;
}

@ccclass('ProtobufMgr')
export class ProtobufMgr extends SingleBase<ProtobufMgr>{

    DeserializePlayer<T extends ProtobufMessage<T>>(data: Uint8Array, MessageType: ProtobufMessage<T>): T {
        const message = MessageType.deserializeBinary(data);
        return message;
    }
}



export const messageMappings = {
    1: Player,
};

// 注意：这里使用字符串而非实际类引用，因为直接引用由.proto生成的类在TypeScript中不可行。
export class MessageIds {

    // 示例：通过ID获取消息类名
    static getMessageClassNameById(messageId: number): string | undefined {
        return messageMappings[messageId];
    }
}
