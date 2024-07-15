@echo off
@echo start delete client old .proto files
set "dirPath=..\client\assets\scripts\net\protobuf\message\"

for /f "delims=" %%i in ('dir "%dirPath%" /b /s /a-d-h') do (
    echo Deleting: %%i
    if exist "%%i" (
        del /q "%%i"
    )
    if exist "%%i" (
        rmdir /s /q "%%i"
    )
)

set PROTO_DIR=.\proto
set OUTPUT_DIR=.\..\server\service\proto
for %%i in (%PROTO_DIR%\*.proto) do (
    @echo gen %%~ni.pb end
    .\protoc.exe --descriptor_set_out=%OUTPUT_DIR%\%%~ni.pb %%i
)

@echo start gen ts protobuf class 
protoc.exe  .\proto\*.proto --plugin=protoc-gen-ts.cmd --ts_out=..\client\assets\scripts\net\protobuf\message\

generate_mapping.exe --protoc_path="protoc.exe" --protoc_ts_plugin_path="protoc-gen-ts.cmd" --proto_files_path=proto\*.proto --message_ids_file_ts=..\client\assets\scripts\net\protobuf\message_ids.ts 
pause