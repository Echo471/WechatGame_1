# -*- coding: utf-8 -*-
from const.module_const import EModule
from module.base.module_register import ModuleRegister


class NetHelper():
    login_module = ModuleRegister.get(EModule.Login)