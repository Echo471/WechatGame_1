@echo off
setlocal enabledelayedexpansion
@REM set "dirPath=.\..\server\"

@REM @echo start delete server old .proto files
@REM for /f "delims=" %%i in ('dir "%dirPath%" /b /s /a-d-h') do (
@REM     echo Deleting: %%i
@REM     if exist "%%i" (
@REM         del /q "%%i"
@REM     )
@REM     if exist "%%i" (
@REM         rmdir /s /q "%%i"
@REM     )
@REM )

@echo .
@echo .

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

@echo .
@echo .

@echo start gen java protobuf class 
protoc.exe .\proto\*.proto --java_out=.\..\server


@echo .
@echo .

@echo start gen ts protobuf class 
protoc.exe  .\proto\*.proto --plugin=protoc-gen-ts.cmd --ts_out=..\client\assets\scripts\net\protobuf\message\


@echo .
@echo .

:: generate_mapping.exe --protoc_path="protoc.exe" --protoc_ts_plugin_path="protoc-gen-ts.cmd" --proto_files_path=proto\*.proto --message_ids_file_ts=..\client\assets\scripts\net\protobuf\message_ids.ts --message_ids_file_java=..\server\message_ids.java


@echo .
@echo .
pause