'use client'

import { useState } from 'react'
import { useAppStore, getFilesInFolder, getFoldersInFolder } from '@/lib/store'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { ChevronRight, ChevronDown, FileText, Folder, Plus, MoreHorizontal, Edit, Trash2 } from 'lucide-react'

interface FileExplorerProps {
  onFileSelect: (file: any) => void
  selectedFileId?: string
}

export default function FileExplorer({ onFileSelect, selectedFileId }: FileExplorerProps) {
  const { files, folders, addFile, addFolder, deleteFile, deleteFolder, updateFile, updateFolder } = useAppStore()
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set())
  const [isCreateDialogOpen, setIsCreateDialogOpen] = useState(false)
  const [newItemName, setNewItemName] = useState('')
  const [newItemType, setNewItemType] = useState<'file' | 'folder'>('file')
  const [editingItem, setEditingItem] = useState<{ id: number; name: string; type: 'file' | 'folder' } | null>(null)
  const [currentFolderId, setCurrentFolderId] = useState<number | undefined>(undefined)

  const toggleFolder = (folderId: string) => {
    const newExpanded = new Set(expandedFolders)
    if (newExpanded.has(folderId)) {
      newExpanded.delete(folderId)
    } else {
      newExpanded.add(folderId)
    }
    setExpandedFolders(newExpanded)
  }

  const handleCreate = async () => {
    if (!newItemName.trim()) return

    try {
      if (newItemType === 'file') {
        await addFile(newItemName, '', currentFolderId)
      } else {
        await addFolder(newItemName, currentFolderId)
      }

      setNewItemName('')
      setIsCreateDialogOpen(false)
    } catch (error) {
      console.error('Failed to create item:', error)
    }
  }

  const handleRename = async (id: number, newName: string, type: 'file' | 'folder') => {
    try {
      if (type === 'file') {
        await updateFile(id, newName)
      } else {
        await updateFolder(id, newName)
      }
      setEditingItem(null)
    } catch (error) {
      console.error('Failed to rename item:', error)
    }
  }

  const handleDelete = async (id: number, type: 'file' | 'folder') => {
    try {
      if (type === 'file') {
        await deleteFile(id)
      } else {
        await deleteFolder(id)
      }
    } catch (error) {
      console.error('Failed to delete item:', error)
    }
  }

  const renderFile = (file: any) => (
    <div
      key={file.id}
      className={`group flex items-center justify-between px-2 py-1 hover:bg-gray-100 cursor-pointer rounded ${
        selectedFileId === file.id ? 'bg-blue-100' : ''
      }`}
      onClick={() => onFileSelect(file)}
    >
      <div className="flex items-center flex-1 min-w-0">
        <FileText className="h-4 w-4 text-gray-500 mr-2 flex-shrink-0" />
        <span className="text-sm text-gray-700 truncate">{file.name}</span>
      </div>
      <DropdownMenu>
        <DropdownMenuTrigger asChild>
          <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0">
            <MoreHorizontal className="h-3 w-3" />
          </Button>
        </DropdownMenuTrigger>
        <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setEditingItem({ id: file.id, name: file.name, type: 'file' })}>
            <Edit className="mr-2 h-3 w-3" />
            Rename
          </DropdownMenuItem>
          <DropdownMenuItem 
            onClick={() => handleDelete(file.id, 'file')}
            className="text-red-600"
          >
            <Trash2 className="mr-2 h-3 w-3" />
            Delete
          </DropdownMenuItem>
        </DropdownMenuContent>
      </DropdownMenu>
    </div>
  )

  const renderFolder = (folder: any) => (
    <div key={folder.id}>
      <div
        className="group flex items-center justify-between px-2 py-1 hover:bg-gray-100 cursor-pointer rounded"
        onClick={() => {
          toggleFolder(folder.id.toString())
          setCurrentFolderId(folder.id)
        }}
      >
        <div className="flex items-center flex-1 min-w-0">
          {expandedFolders.has(folder.id.toString()) ? (
            <ChevronDown className="h-4 w-4 text-gray-500 mr-1 flex-shrink-0" />
          ) : (
            <ChevronRight className="h-4 w-4 text-gray-500 mr-1 flex-shrink-0" />
          )}
          <Folder className="h-4 w-4 text-blue-500 mr-2 flex-shrink-0" />
          <span className="text-sm text-gray-700 truncate">{folder.name}</span>
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="sm" className="opacity-0 group-hover:opacity-100 h-6 w-6 p-0">
              <MoreHorizontal className="h-3 w-3" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent>
            <DropdownMenuItem onClick={() => setEditingItem({ id: folder.id, name: folder.name, type: 'folder' })}>
              <Edit className="mr-2 h-3 w-3" />
              Rename
            </DropdownMenuItem>
            <DropdownMenuItem 
              onClick={() => handleDelete(folder.id, 'folder')}
              className="text-red-600"
            >
              <Trash2 className="mr-2 h-3 w-3" />
              Delete
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
      {expandedFolders.has(folder.id.toString()) && (
        <div className="ml-4">
          {files.filter(f => f.folder_id === folder.id).map(renderFile)}
          {folders.filter(f => f.parent_id === folder.id).map(renderFolder)}
        </div>
      )}
    </div>
  )

  return (
    <div className="h-full bg-white border-r">
      <div className="p-4 border-b">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-sm font-semibold text-gray-700">Explorer</h2>
          <div className="flex gap-1">
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setNewItemType('file')
                setIsCreateDialogOpen(true)
              }}
            >
              <FileText className="h-4 w-4" />
            </Button>
            <Button 
              size="sm" 
              variant="outline"
              onClick={() => {
                setNewItemType('folder')
                setIsCreateDialogOpen(true)
              }}
            >
              <Folder className="h-4 w-4" />
            </Button>
          </div>
        </div>
        
        {/* Breadcrumb */}
        {currentFolderId && (
          <div className="text-xs text-gray-500 mb-2">
            <button 
              onClick={() => setCurrentFolderId(undefined)}
              className="hover:text-gray-700"
            >
              Root
            </button>
            <span className="mx-1">/</span>
            <span>Current Folder</span>
          </div>
        )}
        
        <Dialog open={isCreateDialogOpen} onOpenChange={setIsCreateDialogOpen}>
          <DialogTrigger asChild>
            <div style={{ display: 'none' }} />
          </DialogTrigger>
            <DialogContent>
              <DialogHeader>
                <DialogTitle>Create New Item</DialogTitle>
              </DialogHeader>
              <div className="space-y-4">
                <div className="flex gap-2">
                  <Button
                    variant={newItemType === 'file' ? 'default' : 'outline'}
                    onClick={() => setNewItemType('file')}
                    className="flex-1"
                  >
                    <FileText className="mr-2 h-4 w-4" />
                    File
                  </Button>
                  <Button
                    variant={newItemType === 'folder' ? 'default' : 'outline'}
                    onClick={() => setNewItemType('folder')}
                    className="flex-1"
                  >
                    <Folder className="mr-2 h-4 w-4" />
                    Folder
                  </Button>
                </div>
                <Input
                  placeholder={`Enter ${newItemType} name...`}
                  value={newItemName}
                  onChange={(e) => setNewItemName(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && handleCreate()}
                />
                <div className="flex justify-end gap-2">
                  <Button variant="outline" onClick={() => setIsCreateDialogOpen(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreate} disabled={!newItemName.trim()}>
                    Create
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
      </div>
      
      <div className="p-2">
        {/* Root level items */}
        {files.filter(f => !f.folder_id).map(renderFile)}
        {folders.filter(f => !f.parent_id).map(renderFolder)}
      </div>

      {/* Rename Dialog */}
      {editingItem && (
        <Dialog open={!!editingItem} onOpenChange={() => setEditingItem(null)}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Rename Item</DialogTitle>
            </DialogHeader>
            <div className="space-y-4">
              <Input
                value={editingItem.name}
                onChange={(e) => setEditingItem({ ...editingItem, name: e.target.value })}
                onKeyPress={(e) => e.key === 'Enter' && handleRename(editingItem.id, editingItem.name, editingItem.type)}
              />
              <div className="flex justify-end gap-2">
                <Button variant="outline" onClick={() => setEditingItem(null)}>
                  Cancel
                </Button>
                <Button onClick={() => handleRename(editingItem.id, editingItem.name, editingItem.type)}>
                  Rename
                </Button>
              </div>
            </div>
          </DialogContent>
        </Dialog>
      )}
    </div>
  )
}
