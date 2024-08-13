# -*- coding: utf-8 -*-
import asyncio
from logging import shutdown
from signal import signal

from const.server_event import ServerEvent
from helper.log_helper import Log
from helper.time_helper import TimeHelper
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

    last_tick_time = TimeHelper.get_current_timestamp()
    while True:
        await asyncio.sleep(1 / 30)
        current_time = TimeHelper.get_current_timestamp()
        ServerEvent.SERVER_TICK.call(current_time - last_tick_time)
        last_tick_time = current_time


if __name__ == '__main__':
    asyncio.run(main())