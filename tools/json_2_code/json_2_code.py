import json
import os
import fnmatch
import argparse
import shutil
from typing import Any, Dict
from jinja2 import Template

def format_name(name: str) -> str:
    parts = name.split('_')
    return ''.join(part.capitalize() for part in parts)

def json_to_ts(json_file: str, output_dir: str) -> None:
    with open(json_file, 'r') as file:
        json_str = file.read()
    file_name = os.path.splitext(os.path.basename(json_file))[0]
    const_name = format_name(file_name)
    interface_name = const_name + 'Line'
    data = json.loads(json_str)
    first_key = list(data.keys())[0]
    ts_interface = dict_to_ts(data[first_key], interface_name)
    ts_data = f'const {const_name}: {{ [key: string]: {interface_name} }} = {json_str};'
    ts_code = ts_interface + '\n' + ts_data
    output_file = os.path.join(output_dir, file_name + '.ts')
    with open(output_file, 'w') as file:
        file.write(ts_code)

def json_to_java(json_file: str, output_dir: str) -> None:
    with open(json_file, 'r') as file:
        json_str = file.read()
    file_name = os.path.splitext(os.path.basename(json_file))[0]
    class_name = format_name(file_name)
    data = json.loads(json_str)
    first_key = list(data.keys())[0]
    java_class = dict_to_java(data[first_key], class_name)
    output_file = os.path.join(output_dir, class_name + '.java')
    with open(output_file, 'w') as file:
        file.write(java_class)

def dict_to_ts(data: Dict[str, Any], name: str = 'RootObject') -> str:
    template_str = 'interface {{ name }} {\n{% for key, value in data.items() %}    {{ key }}: {{ type_map[value.__class__.__name__] }};\n{% endfor %}}'
    template = Template(template_str)
    type_map = {
        'dict': 'any',
        'list': 'any[]',
        'str': 'string',
        'int': 'number',
        'float': 'number',
        'bool': 'boolean',
        'NoneType': 'null',
    }
    return template.render(name=name, data=data, type_map=type_map)

def dict_to_java(data: Dict[str, Any], name: str = 'RootObject') -> str:
    template_str = 'public class {{ name }} {\n{% for key, value in data.items() %}    public {{ type_map[value.__class__.__name__] }} {{ key }}n{% endfor %}}'
    template = Template(template_str)
    type_map = {
        'dict': 'Object',
        'list': 'List<Object>',
        'str': 'String',
        'int': 'int',
        'float': 'float',
        'bool': 'boolean',
        'NoneType': 'null',
    }
    return template.render(name=name, data=data, type_map=type_map)

def clear_directory(dir_path):
    for filename in os.listdir(dir_path):
        file_path = os.path.join(dir_path, filename)
        try:
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            print('Failed to delete %s. Reason: %s' % (file_path, e))

def process_directory(input_dir: str, output_ts_dir: str, output_java_dir: str, ts: bool, java: bool) -> None:
    if ts:
        clear_directory(output_ts_dir)
    if java:
        clear_directory(output_java_dir)
    for root, dirs, files in os.walk(input_dir):
        for file in fnmatch.filter(files, 'cfg_*.json'):
            json_file = os.path.join(root, file)
            relative_path = os.path.relpath(json_file, input_dir)
            if ts:
                output_ts_file_dir = os.path.join(output_ts_dir, os.path.dirname(relative_path))
                os.makedirs(output_ts_file_dir, exist_ok=True)
                json_to_ts(json_file, output_ts_file_dir)
            if java:
                output_java_file_dir = os.path.join(output_java_dir, os.path.dirname(relative_path))
                os.makedirs(output_java_file_dir, exist_ok=True)
                json_to_java(json_file, output_java_file_dir)

def main():
    parser = argparse.ArgumentParser(description='Convert JSON files to TypeScript and Java.')
    parser.add_argument('-json_path', type=str, required=True, help='Input directory for JSON files.')
    parser.add_argument('-ts', action='store_true', help='Generate TypeScript code.')
    parser.add_argument('-java', action='store_true', help='Generate Java code.')
    parser.add_argument('-ts_path', type=str, help='Output directory for TypeScript code.')
    parser.add_argument('-java_path', type=str, help='Output directory for Java code.')
    args = parser.parse_args()

    process_directory(args.json_path, args.ts_path, args.java_path, args.ts, args.java)

if __name__ == '__main__':
    main()