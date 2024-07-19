from abc import ABC, abstractmethod
from typing import Dict, Callable

from helper.log_helper import Log
from lib.event import Event


class BaseModule(ABC):
    @staticmethod
    @abstractmethod
    def register():
        pass

    def __init__(self):
        self.Listener: Dict[Event, Callable] = {}

    def __del__(self):
        self.remove_all_listener()

    def auto_listener(self, event: Event, callback: Callable):
        if event not in self.Listener:
            self.Listener[event] = callback
            event.add_listener(callback)
        else:
            Log.warning("event already exist")

    def remove_listener(self, event: Event):
        if event in self.Listener:
            event.remove_listener(self.Listener[event])
            del self.Listener[event]
        else:
            Log.warning("event not exist")

    def remove_all_listener(self):
        for event, callback in self.Listener.items():
            event.remove_listener(callback)
        self.Listener.clear()