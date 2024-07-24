import time


class Team:
    def __init__(self, team_id,name,description):
        self.team_id = team_id
        self.name = name
        self.description = description
        self.users = []
        self.observer = []
        self.game_started = False
        self.game_timer = None

    def add_user(self, user):
        self.users.append(user)

    def remove_user(self, user):
        if user in self.users:
            self.users.remove(user)

    def start_game(self):
        self.game_started = True
        self.game_timer = time.time()

    def is_game_full(self):
        # 队伍最多容纳3名玩家
        return len(self.users) >= 3

    def can_start_game(self):
        # 队伍满3名玩家后才能开始游戏
        return self.is_game_full() and not self.game_started

    def get_elapsed_time(self):
        # 如果游戏未开始，返回None
        if not self.game_started:
            return None
        # 返回游戏开始后的经过时间
        return time.time() - self.game_timer

    def add_observer(self, observer):
        # 添加观战者
        self.observer.append(observer)

    def remove_observer(self, observer):
        # 删除观战者
        if observer in self.observer:
            self.observer.remove(observer)

    def notify_observers(self, message):
        # 通知所有观战者
        for observer in self.observer:
            observer.update(message)