from fastapi import FastAPI, Depends, HTTPException, status, WebSocket
from fastapi.middleware.cors import CORSMiddleware
from sqlalchemy.orm import Session
from typing import List

from database import get_db, engine
import models
import schemas
from websocket import websocket_endpoint

# Create tables
models.Base.metadata.create_all(bind=engine)

app = FastAPI(title="Pensift API", version="1.0.0")

# CORS middleware
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:3000"],  # Frontend URL
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Folder routes
@app.get("/folders", response_model=List[schemas.Folder])
async def read_folders(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    folders = db.query(models.Folder).offset(skip).limit(limit).all()
    return folders

@app.post("/folders", response_model=schemas.Folder)
async def create_folder(
    folder: schemas.FolderCreate, 
    db: Session = Depends(get_db)
):
    db_folder = models.Folder(
        name=folder.name,
        parent_id=folder.parent_id
    )
    db.add(db_folder)
    db.commit()
    db.refresh(db_folder)
    return db_folder

@app.get("/folders/{folder_id}", response_model=schemas.Folder)
async def read_folder(
    folder_id: int, 
    db: Session = Depends(get_db)
):
    folder = db.query(models.Folder).filter(models.Folder.id == folder_id).first()
    if folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    return folder

@app.put("/folders/{folder_id}", response_model=schemas.Folder)
async def update_folder(
    folder_id: int, 
    folder: schemas.FolderUpdate, 
    db: Session = Depends(get_db)
):
    db_folder = db.query(models.Folder).filter(
        models.Folder.id == folder_id
    ).first()
    if db_folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    if folder.name is not None:
        db_folder.name = folder.name
    
    db.commit()
    db.refresh(db_folder)
    return db_folder

@app.delete("/folders/{folder_id}")
async def delete_folder(
    folder_id: int, 
    db: Session = Depends(get_db)
):
    folder = db.query(models.Folder).filter(
        models.Folder.id == folder_id
    ).first()
    if folder is None:
        raise HTTPException(status_code=404, detail="Folder not found")
    
    db.delete(folder)
    db.commit()
    return {"message": "Folder deleted successfully"}

# File routes
@app.get("/files", response_model=List[schemas.File])
async def read_files(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    files = db.query(models.File).offset(skip).limit(limit).all()
    return files

@app.post("/files", response_model=schemas.File)
async def create_file(
    file: schemas.FileCreate, 
    db: Session = Depends(get_db)
):
    db_file = models.File(
        name=file.name,
        content=file.content,
        folder_id=file.folder_id
    )
    db.add(db_file)
    db.commit()
    db.refresh(db_file)
    return db_file

@app.get("/files/{file_id}", response_model=schemas.File)
async def read_file(
    file_id: int, 
    db: Session = Depends(get_db)
):
    file = db.query(models.File).filter(
        models.File.id == file_id
    ).first()
    if file is None:
        raise HTTPException(status_code=404, detail="File not found")
    return file

@app.put("/files/{file_id}", response_model=schemas.File)
async def update_file(
    file_id: int, 
    file: schemas.FileUpdate, 
    db: Session = Depends(get_db)
):
    db_file = db.query(models.File).filter(
        models.File.id == file_id
    ).first()
    if db_file is None:
        raise HTTPException(status_code=404, detail="File not found")
    
    if file.name is not None:
        db_file.name = file.name
    if file.content is not None:
        db_file.content = file.content
    
    db.commit()
    db.refresh(db_file)
    return db_file

@app.delete("/files/{file_id}")
async def delete_file(
    file_id: int, 
    db: Session = Depends(get_db)
):
    file = db.query(models.File).filter(
        models.File.id == file_id
    ).first()
    if file is None:
        raise HTTPException(status_code=404, detail="File not found")
    
    db.delete(file)
    db.commit()
    return {"message": "File deleted successfully"}

# Timeline routes
@app.get("/timeline", response_model=List[schemas.Timeline])
async def read_timeline(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    timeline = db.query(models.Timeline).join(models.File).offset(skip).limit(limit).all()
    return timeline

@app.post("/timeline", response_model=schemas.Timeline)
async def create_timeline_entry(
    timeline: schemas.TimelineCreate, 
    db: Session = Depends(get_db)
):
    # Verify file exists
    file = db.query(models.File).filter(
        models.File.id == timeline.file_id
    ).first()
    if file is None:
        raise HTTPException(status_code=404, detail="File not found")
    
    db_timeline = models.Timeline(
        file_id=timeline.file_id,
        milestone_name=timeline.milestone_name,
        timestamp=timeline.timestamp
    )
    db.add(db_timeline)
    db.commit()
    db.refresh(db_timeline)
    return db_timeline

# Graph routes
@app.get("/graph/nodes", response_model=List[schemas.GraphNode])
async def read_graph_nodes(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    nodes = db.query(models.GraphNode).join(models.File).offset(skip).limit(limit).all()
    return nodes

@app.post("/graph/nodes", response_model=schemas.GraphNode)
async def create_graph_node(
    node: schemas.GraphNodeCreate, 
    db: Session = Depends(get_db)
):
    # Verify file exists
    file = db.query(models.File).filter(
        models.File.id == node.file_id
    ).first()
    if file is None:
        raise HTTPException(status_code=404, detail="File not found")
    
    db_node = models.GraphNode(
        file_id=node.file_id,
        node_name=node.node_name,
        node_metadata=node.node_metadata
    )
    db.add(db_node)
    db.commit()
    db.refresh(db_node)
    return db_node

@app.get("/graph/edges", response_model=List[schemas.GraphEdge])
async def read_graph_edges(
    skip: int = 0, 
    limit: int = 100, 
    db: Session = Depends(get_db)
):
    edges = db.query(models.GraphEdge).join(models.GraphNode, models.GraphEdge.from_node == models.GraphNode.id).join(models.File).offset(skip).limit(limit).all()
    return edges

@app.post("/graph/edges", response_model=schemas.GraphEdge)
async def create_graph_edge(
    edge: schemas.GraphEdgeCreate, 
    db: Session = Depends(get_db)
):
    # Verify both nodes exist
    from_node = db.query(models.GraphNode).join(models.File).filter(
        models.GraphNode.id == edge.from_node
    ).first()
    to_node = db.query(models.GraphNode).join(models.File).filter(
        models.GraphNode.id == edge.to_node
    ).first()
    
    if from_node is None or to_node is None:
        raise HTTPException(status_code=404, detail="One or both nodes not found")
    
    db_edge = models.GraphEdge(
        from_node=edge.from_node,
        to_node=edge.to_node
    )
    db.add(db_edge)
    db.commit()
    db.refresh(db_edge)
    return db_edge

# WebSocket endpoint
@app.websocket("/ws/{user_id}")
async def websocket_route(websocket: WebSocket, user_id: int):
    await websocket_endpoint(websocket, user_id)

if __name__ == "__main__":
    import uvicorn
    uvicorn.run(app, host="0.0.0.0", port=8000)
