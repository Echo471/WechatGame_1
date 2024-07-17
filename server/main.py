# -*- coding: utf-8 -*-
import time

from module.log_module import LogModule
from module.login.login_module import LoginModule
from module.net_module import NetModule


def register_module():
    LogModule.register()
    NetModule.register()
    LoginModule.register()


if __name__ == '__main__':
    register_module()

    while(1):
        time.sleep(1000 / 30)