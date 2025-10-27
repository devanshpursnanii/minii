'use client'

import { useState, useRef, useEffect } from 'react'
import Navbar from '@/components/Navbar'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Plus, Calendar, Edit, Trash2, ZoomIn, ZoomOut, RotateCcw } from 'lucide-react'

interface Milestone {
  id: string
  title: string
  timestamp: Date
  x: number
}

export default function TimelinePage() {
  const [milestones, setMilestones] = useState<Milestone[]>([
    { id: '1', title: 'Project Start', timestamp: new Date('2024-01-01'), x: 100 },
    { id: '2', title: 'First Draft', timestamp: new Date('2024-02-15'), x: 300 },
    { id: '3', title: 'Review Phase', timestamp: new Date('2024-03-01'), x: 500 },
  ])
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [editingMilestone, setEditingMilestone] = useState<Milestone | null>(null)
  const [newMilestoneTitle, setNewMilestoneTitle] = useState('')
  const [newMilestoneDate, setNewMilestoneDate] = useState('')
  const [zoom, setZoom] = useState(1)
  const [scrollPosition, setScrollPosition] = useState(0)
  const timelineRef = useRef<HTMLDivElement>(null)

  const handleCreateMilestone = () => {
    if (!newMilestoneTitle.trim() || !newMilestoneDate) return

    const newMilestone: Milestone = {
      id: Date.now().toString(),
      title: newMilestoneTitle,
      timestamp: new Date(newMilestoneDate),
      x: Math.max(...milestones.map(m => m.x)) + 200,
    }

    setMilestones([...milestones, newMilestone])
    setNewMilestoneTitle('')
    setNewMilestoneDate('')
    setIsCreateDialogOpen(false)
  }

  const handleEditMilestone = (milestone: Milestone) => {
    setEditingMilestone(milestone)
    setNewMilestoneTitle(milestone.title)
    setNewMilestoneDate(milestone.timestamp.toISOString().split('T')[0])
  }

  const handleUpdateMilestone = () => {
    if (!editingMilestone || !newMilestoneTitle.trim() || !newMilestoneDate) return

    setMilestones(milestones.map(m => 
      m.id === editingMilestone.id 
        ? { ...m, title: newMilestoneTitle, timestamp: new Date(newMilestoneDate) }
        : m
    ))
    setEditingMilestone(null)
    setNewMilestoneTitle('')
    setNewMilestoneDate('')
  }

  const handleDeleteMilestone = (id: string) => {
    setMilestones(milestones.filter(m => m.id !== id))
  }

  const handleZoomIn = () => {
    setZoom(prev => Math.min(prev + 0.2, 3))
  }

  const handleZoomOut = () => {
    setZoom(prev => Math.max(prev - 0.2, 0.5))
  }

  const handleResetZoom = () => {
    setZoom(1)
    setScrollPosition(0)
  }

  const handleScroll = (e: React.UIEvent<HTMLDivElement>) => {
    setScrollPosition(e.currentTarget.scrollLeft)
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="p-6">
        <div className="mb-6 flex items-center justify-between">
          <h1 className="text-3xl font-bold text-gray-900">Timeline</h1>
          <div className="flex items-center gap-3">
            <Button variant="outline" onClick={handleZoomOut}>
              <ZoomOut className="h-4 w-4" />
            </Button>
            <span className="text-sm text-gray-600">{Math.round(zoom * 100)}%</span>
            <Button variant="outline" onClick={handleZoomIn}>
              <ZoomIn className="h-4 w-4" />
            </Button>
            <Button variant="outline" onClick={handleResetZoom}>
              <RotateCcw className="h-4 w-4" />
            </Button>
            <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
              <DialogTrigger asChild>
                <Button>
                  <Plus className="mr-2 h-4 w-4" />
                  Add Milestone
                </Button>
              </DialogTrigger>
              <DialogContent>
                <DialogHeader>
                  <DialogTitle>Create New Milestone</DialogTitle>
                </DialogHeader>
                <div className="space-y-4">
                  <Input
                    placeholder="Milestone title"
                    value={newMilestoneTitle}
                    onChange={(e) => setNewMilestoneTitle(e.target.value)}
                  />
                  <Input
                    type="date"
                    value={newMilestoneDate}
                    onChange={(e) => setNewMilestoneDate(e.target.value)}
                  />
                  <div className="flex justify-end gap-2">
                    <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                      Cancel
                    </Button>
                    <Button onClick={handleCreateMilestone} disabled={!newMilestoneTitle.trim() || !newMilestoneDate}>
                      Create
                    </Button>
                  </div>
                </div>
              </DialogContent>
            </Dialog>
          </div>
        </div>

        {/* Timeline Container */}
        <div className="bg-white rounded-lg shadow-sm border">
          <div 
            ref={timelineRef}
            className="overflow-x-auto overflow-y-hidden h-96 relative"
            onScroll={handleScroll}
            style={{ cursor: 'grab' }}
          >
            <div 
              className="relative h-full min-w-max"
              style={{ 
                transform: `scale(${zoom})`,
                transformOrigin: 'top left',
                width: `${Math.max(800, milestones.length * 300)}px`
              }}
            >
              {/* Timeline Line */}
              <div className="absolute top-1/2 left-0 right-0 h-0.5 bg-gray-300 transform -translate-y-1/2"></div>
              
              {/* Milestones */}
              {milestones.map((milestone, index) => (
                <div
                  key={milestone.id}
                  className="absolute top-1/2 transform -translate-y-1/2"
                  style={{ left: `${milestone.x}px` }}
                >
                  {/* Milestone Node */}
                  <div className="relative">
                    <div className="w-4 h-4 bg-blue-500 rounded-full border-2 border-white shadow-lg"></div>
                    <div className="absolute top-6 left-1/2 transform -translate-x-1/2 w-48">
                      <Card className="shadow-lg">
                        <CardHeader className="pb-2">
                          <CardTitle className="text-sm font-medium">{milestone.title}</CardTitle>
                        </CardHeader>
                        <CardContent className="pt-0">
                          <div className="flex items-center text-xs text-gray-500 mb-2">
                            <Calendar className="h-3 w-3 mr-1" />
                            {milestone.timestamp.toLocaleDateString()}
                          </div>
                          <div className="flex gap-1">
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleEditMilestone(milestone)}
                              className="h-6 w-6 p-0"
                            >
                              <Edit className="h-3 w-3" />
                            </Button>
                            <Button
                              size="sm"
                              variant="ghost"
                              onClick={() => handleDeleteMilestone(milestone.id)}
                              className="h-6 w-6 p-0 text-red-500 hover:text-red-700"
                            >
                              <Trash2 className="h-3 w-3" />
                            </Button>
                          </div>
                        </CardContent>
                      </Card>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* Edit Milestone Dialog */}
        {editingMilestone && (
          <Dialog open={!!editingMilestone} onOpenChange={() => setEditingMilestone(null)}>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Edit Milestone</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <Input
                  placeholder="Milestone title"
                  value={newMilestoneTitle}
                  onChange={(e) => setNewMilestoneTitle(e.target.value)}
                />
                <Input
                  type="date"
                  value={newMilestoneDate}
                  onChange={(e) => setNewMilestoneDate(e.target.value)}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setEditingMilestone(null)}>
                    Cancel
                  </Button>
                  <Button onClick={handleUpdateMilestone} disabled={!newMilestoneTitle.trim() || !newMilestoneDate}>
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
