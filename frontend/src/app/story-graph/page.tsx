'use client'

import { useState, useRef, useEffect } from 'react'
import dynamic from 'next/dynamic'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Network, Edit, Trash2, ZoomIn, ZoomOut, RotateCcw, Link } from 'lucide-react'

// Dynamically import react-force-graph to avoid SSR issues
const ForceGraph2D = dynamic(() => import('react-force-graph-2d'), { ssr: false })

interface GraphNode {
  id: string
  name: string
  group: number
  x?: number
  y?: number
  vx?: number
  vy?: number
}

interface GraphLink {
  source: string
  target: string
  id: string
}

export default function StoryGraphPage() {
  const [nodes, setNodes] = useState<GraphNode[]>([
    { id: '1', name: 'Introduction', group: 1 },
    { id: '2', name: 'Chapter 1', group: 2 },
    { id: '3', name: 'Chapter 2', group: 2 },
    { id: '4', name: 'Conclusion', group: 3 },
  ])
  
  const [links, setLinks] = useState<GraphLink[]>([
    { source: '1', target: '2', id: '1-2' },
    { source: '2', target: '3', id: '2-3' },
    { source: '3', target: '4', id: '3-4' },
  ])

  const [isCreateNodeDialogOpen, setIsCreateNodeDialogOpen] = useState(false)
  const [isCreateLinkDialogOpen, setIsCreateLinkDialogOpen] = useState(false)
  const [editingNode, setEditingNode] = useState<GraphNode | null>(null)
  const [newNodeName, setNewNodeName] = useState('')
  const [newNodeGroup, setNewNodeGroup] = useState(1)
  const [selectedSourceNode, setSelectedSourceNode] = useState('')
  const [selectedTargetNode, setSelectedTargetNode] = useState('')
  const [selectedNode, setSelectedNode] = useState<GraphNode | null>(null)
  
  const graphRef = useRef<any>(null)

  const handleCreateNode = () => {
    if (!newNodeName.trim()) return

    const newNode: GraphNode = {
      id: Date.now().toString(),
      name: newNodeName,
      group: newNodeGroup,
    }

    setNodes([...nodes, newNode])
    setNewNodeName('')
    setNewNodeGroup(1)
    setIsCreateNodeDialogOpen(false)
  }

  const handleCreateLink = () => {
    if (!selectedSourceNode || !selectedTargetNode || selectedSourceNode === selectedTargetNode) return

    const newLink: GraphLink = {
      source: selectedSourceNode,
      target: selectedTargetNode,
      id: `${selectedSourceNode}-${selectedTargetNode}`,
    }

    // Check if link already exists
    const linkExists = links.some(link => 
      (link.source === selectedSourceNode && link.target === selectedTargetNode) ||
      (link.source === selectedTargetNode && link.target === selectedSourceNode)
    )

    if (!linkExists) {
      setLinks([...links, newLink])
    }

    setSelectedSourceNode('')
    setSelectedTargetNode('')
    setIsCreateLinkDialogOpen(false)
  }

  const handleEditNode = (node: GraphNode) => {
    setEditingNode(node)
    setNewNodeName(node.name)
    setNewNodeGroup(node.group)
  }

  const handleUpdateNode = () => {
    if (!editingNode || !newNodeName.trim()) return

    setNodes(nodes.map(n => 
      n.id === editingNode.id 
        ? { ...n, name: newNodeName, group: newNodeGroup }
        : n
    ))
    setEditingNode(null)
    setNewNodeName('')
    setNewNodeGroup(1)
  }

  const handleDeleteNode = (nodeId: string) => {
    setNodes(nodes.filter(n => n.id !== nodeId))
    setLinks(links.filter(l => l.source !== nodeId && l.target !== nodeId))
  }

  const handleDeleteLink = (linkId: string) => {
    setLinks(links.filter(l => l.id !== linkId))
  }

  const handleNodeClick = (node: any) => {
    setSelectedNode(node)
  }

  const handleZoomIn = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 20)
    }
  }

  const handleZoomOut = () => {
    if (graphRef.current) {
      const currentZoom = graphRef.current.zoom()
      graphRef.current.zoom(currentZoom * 0.8)
    }
  }

  const handleResetView = () => {
    if (graphRef.current) {
      graphRef.current.zoomToFit(400, 20)
    }
  }

  const getNodeColor = (node: any) => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6']
    return colors[node.group % colors.length]
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Story Graph</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleResetView}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Dialog open={isCreateNodeDialogOpen} onOpenChange={setIsCreateNodeDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline">
                  <Plus className="mr-2 h-4 w-4" />
                  Add Node
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Node</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Node name"
                    value={newNodeName}
                    onChange={(e) => setNewNodeName(e.target.value)}
                  />
                  <Input
                    type="number"
                    placeholder="Group (1-5)"
                    min="1"
                    max="5"
                    value={newNodeGroup}
                    onChange={(e) => setNewNodeGroup(parseInt(e.target.value) || 1)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateNodeDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateNode} disabled={!newNodeName.trim()}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
            <Dialog open={isCreateLinkDialogOpen} onOpenChange={setIsCreateLinkDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Link className="mr-2 h-4 w-4" />
                  Add Link
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Link</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <div>
                    <label className="text-sm font-medium">Source Node</label>
                    <select
                      className="w-full mt-1 p-2 border rounded"
                      value={selectedSourceNode}
                      onChange={(e) => setSelectedSourceNode(e.target.value)}
                    >
                      <option value="">Select source node</option>
                      {nodes.map(node => (
                        <option key={node.id} value={node.id}>{node.name}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="text-sm font-medium">Target Node</label>
                    <select
                      className="w-full mt-1 p-2 border rounded"
                      value={selectedTargetNode}
                      onChange={(e) => setSelectedTargetNode(e.target.value)}
                    >
                      <option value="">Select target node</option>
                      {nodes.map(node => (
                        <option key={node.id} value={node.id}>{node.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateLinkDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button 
                      onClick={handleCreateLink} 
                      disabled={!selectedSourceNode || !selectedTargetNode || selectedSourceNode === selectedTargetNode}
                    >
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
          {/* Graph Visualization */}
          <div className="lg:col-span-3">
            <Card className="h-[600px]">
              <CardContent className="p-0 h-full">
                <ForceGraph2D
                  ref={graphRef}
                  graphData={{ nodes, links }}
                  nodeLabel="name"
                  nodeColor={getNodeColor}
                  nodeCanvasObject={(node: any, ctx: any, globalScale: any) => {
                    const label = node.name
                    const fontSize = 12/globalScale
                    ctx.font = `${fontSize}px Sans-Serif`
                    ctx.textAlign = 'center'
                    ctx.textBaseline = 'middle'
                    ctx.fillStyle = 'white'
                    ctx.fillText(label, node.x, node.y)
                  }}
                  nodeCanvasObjectMode={() => 'after'}
                  onNodeClick={handleNodeClick}
                  linkDirectionalArrowLength={6}
                  linkDirectionalArrowRelPos={1}
                  linkWidth={2}
                  linkColor="#94a3b8"
                  cooldownTicks={100}
                  onEngineStop={() => graphRef.current?.zoomToFit(400, 20)}
                />
              </CardContent>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Selected Node Info */}
            {selectedNode && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-sm">Selected Node</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    <p className="text-sm font-medium">{selectedNode.name}</p>
                    <p className="text-xs text-gray-500">Group: {selectedNode.group}</p>
                    <div className="flex gap-1">
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleEditNode(selectedNode)}
                        className="h-6 w-6 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        onClick={() => handleDeleteNode(selectedNode.id)}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Nodes List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Nodes ({nodes.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {nodes.map(node => (
                    <div
                      key={node.id}
                      className="flex items-center justify-between p-2 rounded hover:bg-gray-50 cursor-pointer"
                      onClick={() => setSelectedNode(node)}
                    >
                      <div className="flex items-center gap-2">
                        <div 
                          className="w-3 h-3 rounded-full"
                          style={{ backgroundColor: getNodeColor(node) }}
                        />
                        <span className="text-sm">{node.name}</span>
                      </div>
                      <div className="flex gap-1">
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleEditNode(node)
                          }}
                          className="h-5 w-5 p-0"
                        >
                          <Edit className="h-3 w-3" />
                        </Button>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={(e) => {
                            e.stopPropagation()
                            handleDeleteNode(node.id)
                          }}
                          className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Links List */}
            <Card>
              <CardHeader>
                <CardTitle className="text-sm">Links ({links.length})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {links.map(link => {
                    const sourceNode = nodes.find(n => n.id === link.source)
                    const targetNode = nodes.find(n => n.id === link.target)
                    return (
                      <div key={link.id} className="flex items-center justify-between p-2 rounded hover:bg-gray-50">
                        <span className="text-sm">
                          {sourceNode?.name} → {targetNode?.name}
                        </span>
                        <Button
                          size="sm"
                          variant="ghost"
                          onClick={() => handleDeleteLink(link.id)}
                          className="h-5 w-5 p-0 text-red-500 hover:text-red-700"
                        >
                          <Trash2 className="h-3 w-3" />
                        </Button>
                      </div>
                    )
                  })}
                </div>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Edit Node Dialog */}
        {editingNode && (
          <Dialog open={!!editingNode} onOpenChange={() => setEditingNode(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Node</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Node name"
                  value={newNodeName}
                  onChange={(e) => setNewNodeName(e.target.value)}
                />
                <Input
                  type="number"
                  placeholder="Group (1-5)"
                  min="1"
                  max="5"
                  value={newNodeGroup}
                  onChange={(e) => setNewNodeGroup(parseInt(e.target.value) || 1)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingNode(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateNode} disabled={!newNodeName.trim()}>
                    Update
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        )}
      </div>
    </div>
  )
}
