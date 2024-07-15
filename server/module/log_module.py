from loguru import logger

from helper.time_helper import TimeHelper
from module.base_module import BaseModule

from module.module_register import ModuleRegister


class LogModule(BaseModule):
    def __init__(self):
        file_name = "saved/server-" + TimeHelper.get_current_date() + ".log"
        logger.add(file_name, level="TRACE")
