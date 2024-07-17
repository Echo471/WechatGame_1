from loguru import logger

from const.module_const import EModule
from helper.time_helper import TimeHelper
from module.base.base_module import BaseModule
from module.base.module_register import ModuleRegister


class LogModule(BaseModule):
    def __init__(self):
        super().__init__()
        file_name = "saved/server-" + TimeHelper.get_current_date() + ".log"
        logger.add(file_name, level="TRACE")

    @staticmethod
    def register():
        ModuleRegister.register(EModule.LOGGER,  LogModule())