from loguru import logger

from const.module_const import EModule
from module.base_module import BaseModule

from module.module_register import ModuleRegister


class LogModule(BaseModule):
    def __init__(self):
        logger.add("saved/log.txt", level="TRACE")
