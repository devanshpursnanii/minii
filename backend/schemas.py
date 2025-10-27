from pydantic import BaseModel
from datetime import datetime
from typing import Optional, List

# Folder schemas
class FolderBase(BaseModel):
    name: str

class FolderCreate(FolderBase):
    parent_id: Optional[int] = None

class FolderUpdate(FolderBase):
    name: Optional[str] = None

class Folder(FolderBase):
    id: int
    parent_id: Optional[int]
    created_at: datetime
    
    class Config:
        from_attributes = True

# File schemas
class FileBase(BaseModel):
    name: str
    content: str = ""

class FileCreate(FileBase):
    folder_id: Optional[int] = None

class FileUpdate(FileBase):
    name: Optional[str] = None
    content: Optional[str] = None

class File(FileBase):
    id: int
    folder_id: Optional[int]
    last_edited_at: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Timeline schemas
class TimelineBase(BaseModel):
    milestone_name: str

class TimelineCreate(TimelineBase):
    file_id: int
    timestamp: Optional[datetime] = None

class Timeline(TimelineBase):
    id: int
    file_id: int
    timestamp: datetime
    created_at: datetime
    
    class Config:
        from_attributes = True

# Graph schemas
class GraphNodeBase(BaseModel):
    node_name: str
    node_metadata: str = "{}"

class GraphNodeCreate(GraphNodeBase):
    file_id: int

class GraphNode(GraphNodeBase):
    id: int
    file_id: int
    created_at: datetime
    
    class Config:
        from_attributes = True

class GraphEdgeBase(BaseModel):
    from_node: int
    to_node: int

class GraphEdgeCreate(GraphEdgeBase):
    pass

class GraphEdge(GraphEdgeBase):
    id: int
    created_at: datetime
    
    class Config:
        from_attributes = True
