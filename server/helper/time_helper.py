from datetime import datetime


class TimeHelper:

    # 获取机器日期+时间

    @staticmethod
    def get_current_date():
        return datetime.now().strftime("%Y-%m-%d-%H-%M-%S")

    # 获取当前机器时间戳
    @staticmethod
    def get_current_timestamp():
        return datetime.now().timestamp()