from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey, Boolean
from sqlalchemy.orm import relationship
from sqlalchemy.sql import func
from database import Base

class Folder(Base):
    __tablename__ = "folders"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    parent_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    parent = relationship("Folder", remote_side=[id])
    children = relationship("Folder", back_populates="parent")
    files = relationship("File", back_populates="folder")

class File(Base):
    __tablename__ = "files"
    
    id = Column(Integer, primary_key=True, index=True)
    name = Column(String, nullable=False)
    content = Column(Text, default="")
    folder_id = Column(Integer, ForeignKey("folders.id"), nullable=True)
    last_edited_at = Column(DateTime(timezone=True), server_default=func.now(), onupdate=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    folder = relationship("Folder", back_populates="files")
    timeline_entries = relationship("Timeline", back_populates="file")
    graph_nodes = relationship("GraphNode", back_populates="file")

class Timeline(Base):
    __tablename__ = "timeline"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    milestone_name = Column(String, nullable=False)
    timestamp = Column(DateTime(timezone=True), server_default=func.now())
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    file = relationship("File", back_populates="timeline_entries")

class GraphNode(Base):
    __tablename__ = "graph_nodes"
    
    id = Column(Integer, primary_key=True, index=True)
    file_id = Column(Integer, ForeignKey("files.id"), nullable=False)
    node_name = Column(String, nullable=False)
    node_metadata = Column(Text, default="{}")
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    file = relationship("File", back_populates="graph_nodes")
    source_edges = relationship("GraphEdge", foreign_keys="GraphEdge.from_node", back_populates="source_node")
    target_edges = relationship("GraphEdge", foreign_keys="GraphEdge.to_node", back_populates="target_node")

class GraphEdge(Base):
    __tablename__ = "graph_edges"
    
    id = Column(Integer, primary_key=True, index=True)
    from_node = Column(Integer, ForeignKey("graph_nodes.id"), nullable=False)
    to_node = Column(Integer, ForeignKey("graph_nodes.id"), nullable=False)
    created_at = Column(DateTime(timezone=True), server_default=func.now())
    
    # Relationships
    source_node = relationship("GraphNode", foreign_keys=[from_node], back_populates="source_edges")
    target_node = relationship("GraphNode", foreign_keys=[to_node], back_populates="target_edges")
