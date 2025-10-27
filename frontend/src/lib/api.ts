const API_BASE_URL = 'http://localhost:8000'

class ApiService {
  private async request<T>(
    endpoint: string, 
    options: RequestInit = {}
  ): Promise<T> {
    const config: RequestInit = {
      headers: {
        'Content-Type': 'application/json',
        ...options.headers,
      },
      ...options,
    }

    const response = await fetch(`${API_BASE_URL}${endpoint}`, config)
    
    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.detail || 'Request failed')
    }

    return response.json()
  }

  // Files
  async getFiles() {
    return this.request('/files')
  }

  async createFile(name: string, content: string = '', folderId?: number) {
    return this.request('/files', {
      method: 'POST',
      body: JSON.stringify({ name, content, folder_id: folderId })
    })
  }

  async updateFile(id: number, name?: string, content?: string) {
    return this.request(`/files/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name, content })
    })
  }

  async deleteFile(id: number) {
    return this.request(`/files/${id}`, {
      method: 'DELETE'
    })
  }

  // Folders
  async getFolders() {
    return this.request('/folders')
  }

  async createFolder(name: string, parentId?: number) {
    return this.request('/folders', {
      method: 'POST',
      body: JSON.stringify({ name, parent_id: parentId })
    })
  }

  async updateFolder(id: number, name: string) {
    return this.request(`/folders/${id}`, {
      method: 'PUT',
      body: JSON.stringify({ name })
    })
  }

  async deleteFolder(id: number) {
    return this.request(`/folders/${id}`, {
      method: 'DELETE'
    })
  }

  // Timeline
  async getTimeline() {
    return this.request('/timeline')
  }

  async createTimelineEntry(fileId: number, milestoneName: string, timestamp?: string) {
    return this.request('/timeline', {
      method: 'POST',
      body: JSON.stringify({ 
        file_id: fileId, 
        milestone_name: milestoneName,
        timestamp: timestamp || new Date().toISOString()
      })
    })
  }

  // Graph
  async getGraphNodes() {
    return this.request('/graph/nodes')
  }

  async createGraphNode(fileId: number, nodeName: string, metadata: string = '{}') {
    return this.request('/graph/nodes', {
      method: 'POST',
      body: JSON.stringify({ 
        file_id: fileId, 
        node_name: nodeName,
        node_metadata: metadata
      })
    })
  }

  async getGraphEdges() {
    return this.request('/graph/edges')
  }

  async createGraphEdge(fromNode: number, toNode: number) {
    return this.request('/graph/edges', {
      method: 'POST',
      body: JSON.stringify({ from_node: fromNode, to_node: toNode })
    })
  }
}

export const apiService = new ApiService()
