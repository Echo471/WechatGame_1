from abc import ABC, abstractmethod


class BaseModule(ABC):
    @abstractmethod
    @abstractmethod
    def register():
        pass
