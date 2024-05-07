import json
import os
import fnmatch
import argparse
import shutil
from typing import Any, Dict
from jinja2 import Template

def format_name(name: str) -> str:
    """
    格式化给定的名称字符串。

    参数:
    name (str): 待格式化的名称，可以包含下划线。

    返回:
    str: 格式化后的名称，所有部分的首字母大写，下划线被移除。
    """
    # 使用下划线分割名称字符串为多个部分
    parts = name.split('_')
    # 将每个部分的首字母大写，并通过空字符串连接所有部分以移除下划线
    return ''.join(part.capitalize() for part in parts)

def json_to_ts(json_file: str, output_dir: str) -> None:
    """
    将JSON文件转换为TypeScript接口和数据定义。

    参数:
    json_file: str - 输入的JSON文件路径。
    output_dir: str - 输出的TypeScript文件所在的目录。

    返回值:
    None
    """
    # 打开JSON文件并读取内容
    print("正在导出文件：", json_file, "......")
    with open(json_file, 'r', encoding='utf-8') as file:  # 增加encoding参数，假设文件是UTF-8编码
        json_str = file.read()
    
    # 获取文件名，去掉扩展名
    file_name = os.path.splitext(os.path.basename(json_file))[0]
    
    # 格式化文件名作为常量和接口名
    const_name = format_name(file_name)
    interface_name = const_name + 'Line'
    
    # 解析JSON字符串为Python字典
    data = json.loads(json_str)
    
    # 从JSON数据中提取第一个键，用于生成TypeScript接口
    first_key = list(data.keys())[0]
    
    # 将JSON对象的第一个键的值转换为TypeScript接口
    ts_interface = dict_to_ts(data[first_key], interface_name)
    
    # 生成TypeScript常量定义，包含整个JSON数据
    ts_data = f'const {const_name}: {{ [key: string]: {interface_name} }} = {json_str};'
    
    # 组合TypeScript接口和数据定义
    ts_code = ts_interface + '\n' + ts_data
    
    # 构建输出文件路径并写入TypeScript代码
    output_file = os.path.join(output_dir, file_name + '.ts')
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(ts_code)

def json_to_java(json_file: str, output_dir: str) -> None:
    """
    将JSON文件转换为Java类文件。
    
    参数:
    json_file: str - 输入的JSON文件路径。
    output_dir: str - 输出的Java类文件目录。
    
    返回值:
    None
    """
    # 打开JSON文件并读取内容
    with open(json_file, 'r', encoding='utf-8') as file:  # 增加encoding参数，假设文件是UTF-8编码
        json_str = file.read()
    
    # 获取文件名并去除扩展名，用于生成Java类名
    file_name = os.path.splitext(os.path.basename(json_file))[0]
    
    # 格式化文件名，作为Java类名
    class_name = format_name(file_name)
    
    # 将JSON字符串解析为Python对象
    data = json.loads(json_str)
    
    # 获取JSON对象的第一个键，假设所有对象具有相同的结构
    first_key = list(data.keys())[0]
    
    # 将Python对象转换为Java类字符串
    java_class = dict_to_java(data[first_key], class_name)
    
    # 拼接输出文件路径，并写入Java类字符串
    output_file = os.path.join(output_dir, class_name + '.java')
    with open(output_file, 'w', encoding='utf-8') as file:
        file.write(java_class)

def dict_to_ts(data: Dict[str, Any], name: str = 'RootObject') -> str:
    """
    将字典数据转换为 TypeScript 接口字符串。

    参数:
    - data: Dict[str, Any], 表示需要转换的数据字典，键为字符串，值可以是任意类型。
    - name: str = 'RootObject', 表示生成的 TypeScript 接口的名称，默认为 'RootObject'。

    返回值:
    - str, 表示根据给定的字典数据生成的 TypeScript 接口字符串。
    """
    # 使用 jinja2 模板引擎准备接口定义的字符串模板
    template_str = 'interface {{ name }} {\n{% for key, value in data.items() %}    {{ key }}: {{ type_map[value.__class__.__name__] }};\n{% endfor %}}'
    template = Template(template_str)
    
    # 定义类型映射，用于将 Python 类型转换为 TypeScript 类型
    type_map = {
        'dict': 'any',
        'list': 'any[]',
        'str': 'string',
        'int': 'number',
        'float': 'number',
        'bool': 'boolean',
        'NoneType': 'null',
    }
    
    # 使用模板和给定的数据渲染生成 TypeScript 接口字符串
    return template.render(name=name, data=data, type_map=type_map)

def dict_to_java(data: dict, name: str = 'RootObject') -> str:
    """
    将字典数据转换为Java类的字符串表示形式。

    参数:
    - data: dict, 表示要转换的数据字典，键为字段名，值为字段类型。值可以是基本类型、列表或嵌套字典。
    - name: str, 生成的Java类的名称，默认为'RootObject'。

    返回值:
    - str, 表示生成的Java类的字符串。
    """
    template_str = '''
public class {{ name }} {
{% for key, value in data.items() %}
    {% if value is mapping %}
        {{ key }} {{ value }};
    {% elif value is sequence and value|length > 0 and value[0] is mapping %}
        List<{{ key }}> {{ key }} = new ArrayList<>();
    {% else %}
        {{ type_map[value.__class__.__name__] }} {{ key }};
    {% endif %}
{% endfor %}
}
'''
    template = Template(template_str)

    type_map = {
        'str': 'String',
        'int': 'int',
        'float': 'float',
        'bool': 'boolean',
        'NoneType': 'null',  # 注意：Java中没有直接对应None的类型，此处简化处理
    }

    # 递归处理字典和列表
    def process_value(v):
        if isinstance(v, dict):
            return dict_to_java(v, v.get("__class__", key))  # 假设字典中包含类名信息或使用键作为类名
        elif isinstance(v, list) and v and isinstance(v[0], dict):  # 列表中的元素也是字典
            return f"List<{key}>"
        else:
            return type_map.get(v.__class__.__name__, 'Object')  # 默认为Object

    # 为字典中的每个值生成Java类型的声明
    processed_data = {k: process_value(v) for k, v in data.items()}

    return template.render(name=name, data=processed_data, type_map=type_map)

def clear_directory(dir_path):
    """
    清空指定目录下的所有文件和子目录。

    参数:
    dir_path (str): 需要清空的目录的路径。

    返回值:
    无
    """
    # 遍历指定目录下的所有文件和子目录
    for filename in os.listdir(dir_path):
        file_path = os.path.join(dir_path, filename)  # 拼接完整路径
        
        try:
            # 如果是文件或符号链接，则删除
            if os.path.isfile(file_path) or os.path.islink(file_path):
                os.unlink(file_path)
            # 如果是目录，则递归删除
            elif os.path.isdir(file_path):
                shutil.rmtree(file_path)
        except Exception as e:
            # 删除失败时打印错误信息
            print('Failed to delete %s. Reason: %s' % (file_path, e))

def process_directory(input_dir: str, output_ts_dir: str, output_java_dir: str, ts: bool, java: bool) -> None:
    """
    处理指定目录中的所有json文件，将其转换为TypeScript或Java代码（取决于参数）。

    参数:
    input_dir (str): 输入目录的路径，其中包含要处理的json文件。
    output_ts_dir (str): 生成的TypeScript代码的输出目录。
    output_java_dir (str): 生成的Java代码的输出目录。
    ts (bool): 如果为True，则处理json文件并生成TypeScript代码。
    java (bool): 如果为True，则处理json文件并生成Java代码。
    
    返回值:
    None
    """
    # 根据需求清除输出目录
    if ts:
        clear_directory(output_ts_dir)
    if java:
        clear_directory(output_java_dir)
    
    # 遍历输入目录中的所有文件
    for root, dirs, files in os.walk(input_dir):
        # 筛选出json文件并处理
        for file in fnmatch.filter(files, 'cfg_*.json'):
            json_file = os.path.join(root, file)
            relative_path = os.path.relpath(json_file, input_dir)
            # 生成TypeScript代码
            if ts:
                output_ts_file_dir = os.path.join(output_ts_dir, os.path.dirname(relative_path))
                os.makedirs(output_ts_file_dir, exist_ok=True)
                json_to_ts(json_file, output_ts_file_dir)
            # 生成Java代码
            if java:
                output_java_file_dir = os.path.join(output_java_dir, os.path.dirname(relative_path))
                os.makedirs(output_java_file_dir, exist_ok=True)
                json_to_java(json_file, output_java_file_dir)

def main():
    """
    主函数，用于启动JSON文件到TypeScript和Java代码的转换过程。
    
    参数:
    - 无
    
    返回值:
    - 无
    """
    # 初始化命令行参数解析器
    parser = argparse.ArgumentParser(description='Convert JSON files to TypeScript and Java.')
    # 添加输入JSON文件目录的参数
    parser.add_argument('-json_path', type=str, required=True, help='Input directory for JSON files.')
    # 添加生成TypeScript代码的开关参数
    parser.add_argument('-ts', action='store_true', help='Generate TypeScript code.')
    # 添加生成Java代码的开关参数
    parser.add_argument('-java', action='store_true', help='Generate Java code.')
    # 添加TypeScript代码输出目录的参数
    parser.add_argument('-ts_path', type=str, help='Output directory for TypeScript code.')
    # 添加Java代码输出目录的参数
    parser.add_argument('-java_path', type=str, help='Output directory for Java code.')
    # 解析命令行参数
    args = parser.parse_args()

    # 调用处理目录的函数，开始转换过程
    process_directory(args.json_path, args.ts_path, args.java_path, args.ts, args.java)

if __name__ == '__main__':
    main()