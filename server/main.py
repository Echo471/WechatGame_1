# -*- coding: utf-8 -*-
import asyncio
from module.log_module import LogModule
from module.login.login_module import LoginModule
from module.net_module import NetModule
from protobuf.proto_register import print_all_proto

def register_module():
    LogModule.register()
    NetModule.register()
    LoginModule.register()


async def main():
    register_module()

    print_all_proto()

    while True:
        await asyncio.sleep(1 / 30)


if __name__ == '__main__':
    asyncio.run(main())