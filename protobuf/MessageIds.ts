import { Player } from "./message/proto/test";
import { Player2 } from "./message/proto/test";

export const messageMappings = {
    1: Player,
    2: Player2,
};

// 注意：这里使用字符串而非实际类引用，因为直接引用由.proto生成的类在TypeScript中不可行。
export class MessageIds {

    // 示例：通过ID获取消息类名
    static getMessageClassNameById(messageId: number): string | undefined {
        return messageMappings[messageId];
    }
}
