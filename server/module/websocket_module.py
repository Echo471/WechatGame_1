import asyncio
import websockets

clients = set()


async def handler(websocket, path):
    clients.add(websocket)
    print("新的客户端已连接")
    try:
        async for message in websocket:
            print(f"收到消息: {message}")
            # 将消息广播给所有连接的客户端
            await asyncio.wait([client.send(message) for client in clients if client != websocket])
    except websockets.exceptions.ConnectionClosed:
        print("客户端已断开连接")
    finally:
        clients.remove(websocket)


async def heartbeat():
    while True:
        for client in clients.copy():
            try:
                await client.ping()
            except websockets.exceptions.ConnectionClosed:
                clients.remove(client)
        await asyncio.sleep(30)


start_server = websockets.serve(handler, "localhost", 8080)

asyncio.get_event_loop().run_until_complete(start_server)
asyncio.get_event_loop().run_forever()

print('WebSocket服务器运行在ws://localhost:8080')
