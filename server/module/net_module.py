# -*- coding: utf-8 -*-
import asyncio
from typing import Dict

from const.module_const import EModule
from const.server_event import ServerEvent
from helper.log_helper import Log
from helper.protobuf_helper import ProtobufHelper
from module.base.base_module import BaseModule
import websockets

from module.base.module_register import ModuleRegister
from protobuf.proto_register import ProtobufRegister


class NetModule(BaseModule):
    def __init__(self):
        super().__init__()
        Log.info("websocket server start")
        self.proto_registry: Dict[int, callable] = {}
        self.wait_replay: Dict[int, callable] = {}

    # [start]: websocket
    async def start(self):
        self.server = websockets.serve(self.on_connection, "127.0.0.1", 8888)
        await self.server

    async def on_message(self, websocket):
        try:
            while True:
                recv_data = await websocket.recv()
                await self.process_message(websocket, recv_data)
        except websockets.exceptions.ConnectionClosed:
            Log.info("WebSocket连接已关闭")
            ServerEvent.ON_WEBSOCKET_DISCONNECT.call()

    async def process_message(self, websocket, recv_data):
        Log.info("接收到消息：", recv_data)
        msg_id, msg_data, replay_id, IsReply = ProtobufHelper.deserialize_msg(recv_data)
        if not self.proto_registry.get(msg_id):
            Log.error("未注册的消息ID：", msg_id)
            return

        if IsReply:
            await self.handle_reply(msg_data, replay_id)
        else:
            await self.handle_request(websocket, msg_id, msg_data, replay_id)

    async def handle_reply(self, msg_data, replay_id):
        response_func = self.wait_replay.get(replay_id)
        if response_func:
            await response_func(msg_data)
            del self.wait_replay[replay_id]
        else:
            Log.error("未找到对应的回复函数", replay_id)

    async def handle_request(self, websocket, msg_id, msg_data, replay_id):
        if ProtobufRegister.get(msg_id).replay_msg_cls:
            replay = ProtobufRegister.get(msg_id).replay_msg_cls()
            await self.proto_registry[msg_id](msg_data, replay)
            await websocket.send(ProtobufHelper.serialize_msg(replay, replay_id, True))
        else:
            await self.proto_registry[msg_id](msg_data)


    def request(self):
        pass


    def push(self, msg):
        pass

    async def on_connection(self, websocket, path):
        Log.info("新的websocket连接：", path)
        await self.on_message(websocket)

    # [end]: websocket

    # [start]: register
    def register_proto(self, msg_id: int, callback: callable):
        if msg_id in self.proto_registry:
            Log.error("消息id已经注册", msg_id)
            return
        self.proto_registry[msg_id] = callback

    def unregister_proto(self, msg_id: int):
        if msg_id in self.proto_registry:
            del self.proto_registry[msg_id]
        else:
            Log.error("消息id未注册", msg_id)

    # [end]: register

    @staticmethod
    def register():
        ins = NetModule()
        asyncio.create_task(ins.start())
        ModuleRegister.register(EModule.WebSocket, ins)
