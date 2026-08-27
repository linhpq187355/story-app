import api from '../api/axiosConfig'

const IMPORT_API_PATH = '/api/admin/import'

export const importService = {

  downloadTemplate: async () => {
    const response = await api.get(`${IMPORT_API_PATH}/template`, {
      responseType: 'blob',
    })
    return response.data
  },

  previewImport: async (file) => {
    const formData = new FormData()
    formData.append('file', file)
    const response = await api.post(`${IMPORT_API_PATH}/stories/preview`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    })
    return response.data
  },

  commitImport: async (payload) => {
    const response = await api.post(`${IMPORT_API_PATH}/stories/commit`, payload)
    return response.data
  },
}
