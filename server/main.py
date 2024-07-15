# -*- coding: utf-8 -*-
from const.module_const import EModule
from helper.log_helper import Log
from module.log_module import LogModule
from module.module_register import ModuleRegister


def register_module():
    # register module
    # Log 是最基础的模块 需要最先注册
    ModuleRegister.register(EModule.LOGGER, LogModule())


if __name__ == '__main__':
    register_module()