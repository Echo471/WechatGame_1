from loguru import logger


class Log:
    @staticmethod
    def info(*args):
        logger.info(*args)

    @staticmethod
    def warning(*args):
        logger.warning(*args)

    @staticmethod
    def error(*args):
        logger.critical(*args)
