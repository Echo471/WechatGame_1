
import protobuf.proto.login_pb2 as login_pb2

login_info = login_pb2.LoginRequest()
login_info.UserID = 1

print(login_info)

serialized = login_info.SerializeToString()

print(serialized)

login_info2 = login_pb2.LoginRequest()
login_info2.ParseFromString(serialized)
print(login_info2)