from enum import Enum
from typing import Dict

from helper.log_helper import Log
import protobuf.proto.login_pb2 as login_pb2


class ProtoMsgInfo:
    def __init__(self, msg_class: callable, replay_msg_cls: callable = None):
        self.msg_class = msg_class
        self.replay_msg_cls = replay_msg_cls


class ProtoEnum(Enum):
    ClSID_LoginRequest = 1


ProtobufRegister: Dict[ProtoEnum, ProtoMsgInfo] = {
    ProtoEnum.ClSID_LoginRequest: ProtoMsgInfo(login_pb2.LoginRequest, login_pb2.LoginReplay)
}

# 自动生成一个key为cls， value为msg_id的字典
ProtoCls2MsgID = {v.msg_class: k for k, v in ProtobufRegister.items()}


def print_all_proto():
    Log.warning("-------------------------print all register proto----------------------------")
    for k, v in ProtobufRegister.items():
        Log.info(f"msg_id: {k}, msg_class: {v.msg_class}")
    Log.warning("-------------------------print all register proto----------------------------")


def get_proto_cls(msg_id: int) -> callable:
    return ProtobufRegister.get(msg_id).msg_class

def get_proto_msg_id(cls: callable) -> int:
    return ProtoCls2MsgID.get(cls)