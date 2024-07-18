# -*- coding: utf-8 -*-
import protobuf.proto.base_pb2 as base_pb2
from protobuf.proto_register import ProtoEnum, get_proto_cls


class ProtobufHelper:
    @staticmethod
    def deserialize_msg(msg: bytes) -> (ProtoEnum , callable):
        base_msg = base_pb2.BaseMsg()
        base_msg.ParseFromString(msg)

        msg_id = base_msg.MsgID
        msg_cls = get_proto_cls(msg_id)

        msg = msg_cls()
        msg.ParseFromString(base_msg.Data)

        return msg_id, msg

    @staticmethod
    def serialize_msg(msg, reply_id: int, is_replay: bool) -> bytes:
        msg_cls: callable = msg.__class__
        msg_id = get_proto_cls(msg_cls)
        data = msg.SerializeToString()

        base_msg = base_pb2.BaseMsg()
        base_msg.MsgID = msg_id
        base_msg.Data = data
        base_msg.ReplyID = reply_id
        base_msg.IsReply = is_replay

        return base_msg.SerializeToString()



