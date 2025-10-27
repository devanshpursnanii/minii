from fastapi import WebSocket, WebSocketDisconnect
from typing import List, Dict
import json
import asyncio
from datetime import datetime

class ConnectionManager:
    def __init__(self):
        self.active_connections: List[WebSocket] = []
        self.user_connections: Dict[int, List[WebSocket]] = {}

    async def connect(self, websocket: WebSocket, user_id: int):
        await websocket.accept()
        self.active_connections.append(websocket)
        if user_id not in self.user_connections:
            self.user_connections[user_id] = []
        self.user_connections[user_id].append(websocket)

    def disconnect(self, websocket: WebSocket, user_id: int):
        if websocket in self.active_connections:
            self.active_connections.remove(websocket)
        if user_id in self.user_connections and websocket in self.user_connections[user_id]:
            self.user_connections[user_id].remove(websocket)

    async def send_personal_message(self, message: str, websocket: WebSocket):
        try:
            await websocket.send_text(message)
        except:
            pass

    async def broadcast_to_user(self, message: str, user_id: int):
        if user_id in self.user_connections:
            for connection in self.user_connections[user_id]:
                try:
                    await connection.send_text(message)
                except:
                    pass

    async def broadcast(self, message: str):
        for connection in self.active_connections:
            try:
                await connection.send_text(message)
            except:
                pass

manager = ConnectionManager()

async def websocket_endpoint(websocket: WebSocket, user_id: int = 1):
    await manager.connect(websocket, user_id)
    try:
        while True:
            data = await websocket.receive_text()
            message = json.loads(data)
            
            # Handle different message types
            if message.get("type") == "file_update":
                # Broadcast file update to all user's connections
                await manager.broadcast_to_user(json.dumps({
                    "type": "file_updated",
                    "file_id": message.get("file_id"),
                    "content": message.get("content"),
                    "timestamp": datetime.now().isoformat()
                }), user_id)
            
            elif message.get("type") == "file_save":
                # Broadcast file save to all user's connections
                await manager.broadcast_to_user(json.dumps({
                    "type": "file_saved",
                    "file_id": message.get("file_id"),
                    "timestamp": datetime.now().isoformat()
                }), user_id)
            
            elif message.get("type") == "folder_update":
                # Broadcast folder update to all user's connections
                await manager.broadcast_to_user(json.dumps({
                    "type": "folder_updated",
                    "folder_id": message.get("folder_id"),
                    "name": message.get("name"),
                    "timestamp": datetime.now().isoformat()
                }), user_id)
            
            elif message.get("type") == "timeline_update":
                # Broadcast timeline update to all user's connections
                await manager.broadcast_to_user(json.dumps({
                    "type": "timeline_updated",
                    "timeline_id": message.get("timeline_id"),
                    "milestone_name": message.get("milestone_name"),
                    "timestamp": datetime.now().isoformat()
                }), user_id)
            
            elif message.get("type") == "graph_update":
                # Broadcast graph update to all user's connections
                await manager.broadcast_to_user(json.dumps({
                    "type": "graph_updated",
                    "node_id": message.get("node_id"),
                    "edge_id": message.get("edge_id"),
                    "timestamp": datetime.now().isoformat()
                }), user_id)
            
            else:
                # Echo back unknown message types
                await manager.send_personal_message(json.dumps({
                    "type": "echo",
                    "message": "Unknown message type",
                    "original": message
                }), websocket)
                
    except WebSocketDisconnect:
        manager.disconnect(websocket, user_id)
    except Exception as e:
        print(f"WebSocket error: {e}")
        manager.disconnect(websocket, user_id)
