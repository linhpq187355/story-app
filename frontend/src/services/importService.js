import api from '../api/axiosConfig'

export const importService = {

  downloadTemplate: async () => {
    const response = await api.get('/admin/import/template', {
      responseType: 'blob',
    })
    return response.data
  },

  previewImport: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post('/admin/import/stories/preview', formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  commitImport: async (payload) => {
    const response = await api.post('/admin/import/stories/commit', payload)
    return response.data
  },
}
