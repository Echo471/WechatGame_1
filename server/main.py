from const.module_const import EModule
from module.log_module import LogModule
from module.module_register import ModuleRegister

if __name__ == '__main__':
    # register module
    ModuleRegister.register(EModule.LOGGER, LogModule())
