## 环境配置
1. 安装Cocos creator 3.8.2
2. 安装node： https://nodejs.org/
3. 安装pbjs <npm install -g pbjs>

## client
- 客户端工程cocos creator 3.8.2

## server

1. 环境 python 3.12.4
2. 日志库 pip install loguru
3. websocket： pip install websockets
4. protobuf库：     pip install protobuf 
                    pip install google 
                    pip install google-cloud
                    pip install google-cloud-vision

# 客户端proto文件处理
1. pbjs C:\Users\wangjinsheng\Desktop\shared\WechatGame_1\protobuf\proto\base.proto  --ts   C:\Users\wangjinsheng\Desktop\shared\WechatGame_1\client\assets\scripts\net\protobuf\proto\base.ts
2. 在net_message_container.ts完成对协议的注册

# 服务器proto文件处理
1. .\protobuf\protoc.exe .\protobuf\proto\base.proto --python_out=./server/




# todo
1. 协议自动化注册工具（不急）