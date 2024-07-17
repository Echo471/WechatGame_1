from typing import Dict


class Event:
    def __init__(self):
        self.listeners = []

    def add_listener(self, listener: callable):
        if listener not in self.listeners:
            self.listeners.append(listener)

    def remove_listener(self, listener: callable):
        if listener in self.listeners:
            self.listeners.remove(listener)

    def call(self, *args, **kwargs):
        for listener in self.listeners:
            listener(*args, **kwargs)