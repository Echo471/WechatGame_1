import asyncio

import websockets

async def handle_connection(websocket, path):
    # 处理连接
    while True:
        message = await websocket.recv()
        print(f"Received message: {message}")
        # 在这里添加自定义的处理逻辑
        await websocket.send(f"Received: {message}")


start_server = websockets.serve(handle_connection, "localhost", 8765)
asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()