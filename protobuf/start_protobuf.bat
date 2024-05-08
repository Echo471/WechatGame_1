
protoc.exe .\proto\*.proto --java_out=.\..\server


protoc --plugin=protoc-gen-ts.cmd --ts_out=..\client\assets\scripts\net\protobuf\message\ proto\*.proto