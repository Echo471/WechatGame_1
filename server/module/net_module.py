# -*- coding: utf-8 -*-
import asyncio
from const.global_const import WebConst
from const.module_const import EModule
from helper.log_helper import Log
from module.base_module import BaseModule
import websockets

from module.module_register import ModuleRegister


class NetModule(BaseModule):
    def __init__(self):
        super().__init__()
        Log.info("websocket server start")

    def start(self):
        self.server = websockets.serve(self.on_connection, "127.0.0.1", 8888)
        asyncio.get_event_loop().run_until_complete(self.server)
        asyncio.get_event_loop().run_forever()

    async def on_message(self, websocket):
        while True:
            recv_text = await websocket.recv()
            Log.info("接收到消息：", recv_text)
            # TODO:

    # 握手并且接收数据
    async def on_connection(self, websocket, path):
        Log.info("新的websocket连接：", path)
        await self.on_message(websocket)


    @staticmethod
    def register():
        ins = NetModule()
        asyncio.run(ins.start())
        ModuleRegister.register(EModule.WebSocket, ins)
