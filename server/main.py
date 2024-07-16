# -*- coding: utf-8 -*-
import time

from const.module_const import EModule
from module.log_module import LogModule
from module.module_register import ModuleRegister
from module.net_module import NetModule


def register_module():
    LogModule.register()
    NetModule.register()


if __name__ == '__main__':
    register_module()

    while(1):
        time.sleep(1000 / 30)