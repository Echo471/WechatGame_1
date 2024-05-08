import os
import json
import re
import glob
import subprocess

PROTOC_PATH = 'protoc.exe'  # 替换为protoc的实际路径
PROTOC_TS_PLUGIN_PATH = 'protoc-gen-ts.cmd'  # 替换为protoc-gen-ts的实际路径
OUTPUT_DIR = 'proto/'
PROTO_FILES_PATH = 'proto/*.proto'  # 替换为你的.proto文件路径
MESSAGE_IDS_FILE_TS = 'MessageIds.ts'
MESSAGE_IDS_FILE_JAVA = 'MessageIds.java'

def generate_dts_files():
    for proto_file in glob.glob(PROTO_FILES_PATH, recursive=True):
        cmd = [
            PROTOC_PATH,
            '--plugin=protoc-gen-ts={}'.format(PROTOC_TS_PLUGIN_PATH),
            '--ts_out={}/'.format(OUTPUT_DIR),
            proto_file
        ]
        subprocess.run(cmd, check=True)

def extract_message_ids():
    message_ids = {}
    for proto_file in glob.glob(PROTO_FILES_PATH, recursive=True):
        with open(proto_file, 'r') as f:
            content = f.read()

        message_pattern = re.compile(r'^message (\w+) {', re.MULTILINE)
        message_matches = message_pattern.finditer(content)
        for message_match in message_matches:
            message_name = message_match.group(1)
            message_ids[message_name] = len(message_ids) + 1  # 自动为每个消息生成唯一的ID

    return message_ids

def write_mapping_to_ts(message_ids, proto_files):
    ts_content = ''

    # 添加导入语句
    for proto_file in proto_files:
        with open(proto_file, 'r') as f:
            content = f.read()
        class_pattern = re.compile(r'^message (\w+) {', re.MULTILINE)
        class_matches = class_pattern.finditer(content)
        for class_match in class_matches:
            class_name = class_match.group(1)
            ts_content += f'import {{ {class_name} }} from "./message/proto/{os.path.splitext(os.path.basename(proto_file))[0]}";\n'
    ts_content += '\n'

    ts_content += f'export const messageMappings = {{\n'
    for id, message_name in message_ids.items():
        ts_content += f'    {message_name}: {id},\n'
    ts_content += '};\n\n'

    ts_content += f'// 注意：这里使用字符串而非实际类引用，因为直接引用由.proto生成的类在TypeScript中不可行。\n'
    ts_content += f'export class MessageIds {{\n'
    ts_content += '\n'
    ts_content += '    // 示例：通过ID获取消息类名\n'
    ts_content += '    static getMessageClassNameById(messageId: number): string | undefined {\n'
    ts_content += '        return messageMappings[messageId];\n'
    ts_content += '    }\n'
    ts_content += '}\n'

    with open(MESSAGE_IDS_FILE_TS, 'w', encoding='utf-8') as output_file:
        output_file.write(ts_content)

def write_mapping_to_java(message_ids):
    java_content = 'package com.example.message;\n\n'

    java_content += 'import java.util.HashMap;\n'
    java_content += 'import java.util.Map;\n\n'

    java_content += 'public enum MessageIds {\n'
    for id, message_name in message_ids.items():
        java_content += f'    {message_name}({id}),\n'
    java_content += '    UNKNOWN(-1);\n\n'

    java_content += '    private int id;\n'
    java_content += '    private static final Map<Integer, MessageIds> idToEnumMap = new HashMap<>();\n\n'
    java_content += '    static {\n'
    for id, message_name in message_ids.items():
        java_content += f'        idToEnumMap.put({id}, {message_name});\n'
    java_content += '    }\n\n'

    java_content += '    private MessageIds(int id) {\n'
    java_content += '        this.id = id;\n'
    java_content += '    }\n\n'
    java_content += '    public int getId() {\n'
    java_content += '        return id;\n'
    java_content += '    }\n\n'
    java_content += '    public static MessageIds fromId(int id) {\n'
    java_content += '        return idToEnumMap.getOrDefault(id, UNKNOWN);\n'
    java_content += '    }\n\n'
    java_content += '}\n'

    with open(MESSAGE_IDS_FILE_JAVA, 'w', encoding='utf-8') as output_file:
        output_file.write(java_content)

if __name__ == '__main__':
    generate_dts_files()
    proto_files = glob.glob('proto/*.proto', recursive=True)  # 获取.proto文件列表
    message_ids = extract_message_ids()
    write_mapping_to_ts(message_ids, proto_files)  # 添加proto_files参数
    write_mapping_to_java(message_ids)