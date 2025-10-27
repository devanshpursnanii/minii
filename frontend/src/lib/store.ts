import { create } from 'zustand'
import { apiService } from './api'

export interface File {
  id: number
  name: string
  content: string
  last_edited_at: string
  folder_id?: number
  created_at: string
}

export interface Folder {
  id: number
  name: string
  parent_id?: number
  created_at: string
}

interface AppState {
  files: File[]
  folders: Folder[]
  currentFile: File | null
  isLoading: boolean
  error: string | null
  
  // Actions
  setFiles: (files: File[]) => void
  setFolders: (folders: Folder[]) => void
  setCurrentFile: (file: File | null) => void
  addFile: (name: string, content?: string, parentFolderId?: number) => Promise<void>
  updateFile: (id: number, name?: string, content?: string) => Promise<void>
  deleteFile: (id: number) => Promise<void>
  addFolder: (name: string, parentFolderId?: number) => Promise<void>
  updateFolder: (id: number, name: string) => Promise<void>
  deleteFolder: (id: number) => Promise<void>
  loadData: () => Promise<void>
  setLoading: (loading: boolean) => void
  setError: (error: string | null) => void
}

export const useAppStore = create<AppState>((set) => ({
  files: [],
  folders: [],
  currentFile: null,
  isLoading: false,
  error: null,
  
  setFiles: (files) => set({ files }),
  setFolders: (folders) => set({ folders }),
  setCurrentFile: (file) => set({ currentFile: file }),
  
  addFile: async (name, content = '', parentFolderId) => {
    try {
      const newFile = await apiService.createFile(name, content, parentFolderId) as File
      set((state) => ({ files: [...state.files, newFile] }))
    } catch (error) {
      console.error('Failed to create file:', error)
      throw error
    }
  },
  
  updateFile: async (id, name, content) => {
    try {
      const updatedFile = await apiService.updateFile(id, name, content) as File
      set((state) => ({
        files: state.files.map(file => 
          file.id === id ? updatedFile : file
        )
      }))
    } catch (error) {
      console.error('Failed to update file:', error)
      throw error
    }
  },
  
  deleteFile: async (id) => {
    try {
      await apiService.deleteFile(id)
      set((state) => ({
        files: state.files.filter(file => file.id !== id)
      }))
    } catch (error) {
      console.error('Failed to delete file:', error)
      throw error
    }
  },
  
  addFolder: async (name, parentFolderId) => {
    try {
      const newFolder = await apiService.createFolder(name, parentFolderId) as Folder
      set((state) => ({ folders: [...state.folders, newFolder] }))
    } catch (error) {
      console.error('Failed to create folder:', error)
      throw error
    }
  },
  
  updateFolder: async (id, name) => {
    try {
      const updatedFolder = await apiService.updateFolder(id, name) as Folder
      set((state) => ({
        folders: state.folders.map(folder =>
          folder.id === id ? updatedFolder : folder
        )
      }))
    } catch (error) {
      console.error('Failed to update folder:', error)
      throw error
    }
  },
  
  deleteFolder: async (id) => {
    try {
      await apiService.deleteFolder(id)
      set((state) => ({
        folders: state.folders.filter(folder => folder.id !== id)
      }))
    } catch (error) {
      console.error('Failed to delete folder:', error)
      throw error
    }
  },

  loadData: async () => {
    try {
      const [files, folders] = await Promise.all([
        apiService.getFiles(),
        apiService.getFolders()
      ])
      set({ files: files as File[], folders: folders as Folder[] })
    } catch (error) {
      console.error('Failed to load data:', error)
      throw error
    }
  },
  
  setLoading: (isLoading) => set({ isLoading }),
  setError: (error) => set({ error }),
}))

// Helper functions
export const getFilesInFolder = (folderId?: number) => {
  const state = useAppStore.getState()
  return state.files.filter(file => file.folder_id === folderId)
}

export const getFoldersInFolder = (folderId?: number) => {
  const state = useAppStore.getState()
  return state.folders.filter(folder => folder.parent_id === folderId)
}
