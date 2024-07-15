from helper.log_helper import Log


class ModuleRegister:
    modules = {}

    @staticmethod
    def register(enum_module_type, module):
        if enum_module_type in ModuleRegister.modules:
            Log.error("Module with name {} already exists.", enum_module_type.name)
            return
        ModuleRegister.modules[enum_module_type] = module
        Log.info("Module {} registered successfully.", enum_module_type.name)

    @staticmethod
    def unregister(enum_module_type):
        if enum_module_type not in ModuleRegister.modules:
            Log.error("Module with name {} does not exist.", enum_module_type.name)
            return
        del ModuleRegister.modules[enum_module_type]

    @staticmethod
    def get(enum_module_type):
        if enum_module_type not in ModuleRegister.modules:
            Log.error("Module with name {} does not exist.", enum_module_type.name)
            return None
        return ModuleRegister.modules[enum_module_type]