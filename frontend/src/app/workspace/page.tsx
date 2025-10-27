'use client'

import { useState, useEffect } from 'react'
import { useAppStore } from '@/lib/store'
import Navbar from '@/components/Navbar'
import FileExplorer from '@/components/FileExplorer'
import RichTextEditor from '@/components/RichTextEditor'
import { Button } from '@/components/ui/button'
import { Save, FileText } from 'lucide-react'

export default function WorkspacePage() {
  const { currentFile, updateFile, setCurrentFile } = useAppStore()
  const [content, setContent] = useState('')
  const [isSaving, setIsSaving] = useState(false)

  // Auto-save effect
  useEffect(() => {
    if (!currentFile) return

    const autoSave = async () => {
      if (content !== currentFile.content) {
        setIsSaving(true)
        try {
          await updateFile(currentFile.id, undefined, content)
        } catch (error) {
          console.error('Auto-save failed:', error)
        }
        setTimeout(() => setIsSaving(false), 1000)
      }
    }

    const timer = setTimeout(autoSave, 2000) // Auto-save every 2 seconds
    return () => clearTimeout(timer)
  }, [content, currentFile, updateFile])

  const handleFileSelect = (file: any) => {
    setCurrentFile(file)
    setContent(file.content || '')
  }

  const handleContentChange = (newContent: string) => {
    setContent(newContent)
  }

  const handleSave = async () => {
    if (currentFile) {
      setIsSaving(true)
      try {
        await updateFile(currentFile.id, undefined, content)
      } catch (error) {
        console.error('Save failed:', error)
      }
      setTimeout(() => setIsSaving(false), 1000)
    }
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="flex h-[calc(100vh-64px)]">
        {/* File Explorer Sidebar */}
        <div className="w-80 flex-shrink-0">
          <FileExplorer 
            onFileSelect={handleFileSelect}
            selectedFileId={currentFile?.id?.toString()}
          />
        </div>

        {/* Main Editor Area */}
        <div className="flex-1 flex flex-col">
          {currentFile ? (
            <>
              {/* Editor Header */}
              <div className="bg-white border-b px-6 py-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileText className="h-5 w-5 text-gray-500" />
                  <h1 className="text-lg font-medium text-gray-900">{currentFile.name}</h1>
                  {isSaving && (
                    <span className="text-sm text-gray-500">Saving...</span>
                  )}
                </div>
                <Button 
                  onClick={handleSave}
                  disabled={isSaving}
                  size="sm"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSaving ? 'Saving...' : 'Save'}
                </Button>
              </div>

              {/* Editor */}
              <div className="flex-1 p-6">
                <RichTextEditor
                  content={content}
                  onChange={handleContentChange}
                  placeholder="Start writing your document..."
                />
              </div>
            </>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <div className="text-center">
                <FileText className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  No file selected
                </h3>
                <p className="text-gray-500">
                  Choose a file from the explorer to start editing
                </p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
