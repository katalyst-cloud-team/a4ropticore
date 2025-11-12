const API_BASE_URL = "https://a4rdashboardbackend-bcc2c8g9d8bwbfbk.centralus-01.azurewebsites.net"

export const getLocalDateYYYYMMDD = () => {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0'); 
  const day = String(now.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
};

export const API_ENDPOINTS = {
  MACHINES_ACTIVE: "/api/machines/active",
  MACHINES: "/api/machines",
  MACHINE_BY_IP: (ip) => `/api/machine/${ip}`,
  MACHINE_BY_UUID: (uuid) => `/api/machine/uuid/${uuid}`,
  MACHINES_ACTIVE_COUNT: "/api/machines/active/count",
  EVENTS_STREAM: "/api/events/active",
  EVENTS_INACTIVE: "/api/events/inactive",
  EXPORT_MACHINE_PDF: (uuid) => `/api/machine/uuid/${uuid}/export/pdf`,
  DASHBOARD_STATS: "/api/dashboard/stats",
  HEALTH: "/api/health",
  EVENTS: "/api/end_events",
  EXPORT_EXCEL: "/api/events/export/excel",
  EXPORT_PDF: "/api/events/export/pdf",
 STORAGE_LIST: (dateFrom) => `/api/storage/list/homepage?date_from=${dateFrom}`,
  STORAGE_SEARCH: "/api/storage/list",
  STORAGE_LATEST_BY_IP: (ip) => `/api/storage/latest/${ip}`,
}

export const apiRequest = async (endpoint, options = {}) => {
  const url = `${API_BASE_URL}${endpoint}`
  const defaultOptions = {
    headers: {
      "Content-Type": "application/json",
      ...options.headers,
    },
  }

  try {
    const response = await fetch(url, {
      ...defaultOptions,
      ...options,
      headers: {
        ...defaultOptions.headers,
        ...options.headers,
      },
    })

    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`)
    }
    if (options.responseType === 'blob') {
      return response.blob()
    }

    const data = await response.json()
    return { data, status: response.status }
  } catch (error) {
    throw error
  }
}

export const machineAPI = {
  getActiveMachines: async (params = {}) => {
    const searchParams = new URLSearchParams(params)
    try {
      return await apiRequest(`${API_ENDPOINTS.MACHINES_ACTIVE}?${searchParams}`)
    } catch (error) {
      throw error
    }
  },
  getAllMachines: async (params = {}) => {
    const searchParams = new URLSearchParams(params)
    try {
      return await apiRequest(`${API_ENDPOINTS.MACHINES}?${searchParams}`)
    } catch (error) {
      throw error
    }
  },
  getMachineByIP: async (ip) => {
    try {
      return await apiRequest(API_ENDPOINTS.MACHINE_BY_IP(ip))
    } catch (error) {
      throw error
    }
  },
  getMachineByUUID: async (uuid) => {
    try {
      const response = await apiRequest(API_ENDPOINTS.MACHINE_BY_UUID(uuid));
      if (response.data && response.data.success && response.data.data) {
        return { data: response.data.data }; 
      }
      throw new Error(`Invalid response structure for UUID ${uuid}: ${JSON.stringify(response.data)}`);
    } catch (err) {
      throw new Error(`Failed to fetch machine details: ${err.message}`);
    }
  },
  getActiveMachinesCount: async (params = {}) => {
    const searchParams = new URLSearchParams(params)
    try {
      return await apiRequest(`${API_ENDPOINTS.MACHINES_ACTIVE_COUNT}?${searchParams}`)
    } catch (error) {
      throw error
    }
  },
  getDashboardStats: async () => {
    try {
      return await apiRequest(API_ENDPOINTS.DASHBOARD_STATS)
    } catch (error) {
      throw error
    }
  },
  healthCheck: async () => {
    try {
      return await apiRequest(API_ENDPOINTS.HEALTH)
    } catch (error) {
      throw error
    }
  }
}

export const storageAPI = {
  searchStorage: async (params = {}) => {
    const cleanParams = {};
    Object.keys(params).forEach((key) => {
      if (params[key] !== '' && params[key] != null) {
        cleanParams[key] = params[key];
      }
    });
    const queryString = new URLSearchParams(cleanParams).toString();
    const url = `${API_ENDPOINTS.STORAGE_SEARCH}${queryString ? '?' + queryString : ''}`;
    return apiRequest(url);
  },

  getPaginatedStorageList: async (params = {}) => {
    const dateFrom = params.date_from || getLocalDateYYYYMMDD(); // default to today in local time
    const searchParams = new URLSearchParams({
      page: params.page || 1,
      page_size: params.page_size || 10,
      // Include other params except date_from (since it's in the base URL now)
      ...Object.fromEntries(
        Object.entries(params).filter(([key]) => key !== 'date_from')
      ),
    });

    const baseUrl = API_ENDPOINTS.STORAGE_LIST(dateFrom);
    const fullUrl = baseUrl.includes('?')
      ? `${baseUrl}&${searchParams}`
      : `${baseUrl}?${searchParams}`;

    return apiRequest(fullUrl);
  },

  getLatestStorageByIP: async (ip, createdAt = null) => {
    if (!ip) throw new Error("IP address is required");
    let url = API_ENDPOINTS.STORAGE_LATEST_BY_IP(ip);
    if (createdAt) {
      const params = new URLSearchParams({ created_at: createdAt });
      url += `?${params.toString()}`;
    }
    return apiRequest(url);
  },

};

export const createEventSource = (endpoint) => {
  const url = `${API_BASE_URL}${endpoint}`
  return new EventSource(url)
}

export const createInactiveEventSource = (endpoint) => {
  const url = `${API_BASE_URL}${endpoint}`
  return new EventSource(url)
}

export const checkAPIHealth = async () => {
  try {
    const response = await machineAPI.healthCheck()
    return {
      isHealthy: response.data.status === 'healthy',
      details: response.data
    }
  } catch (error) {
    return {
      isHealthy: false,
      error: error.message
    }
  }
}

export const fetchEvents = async (params = {}) => {
  try {
    const queryString = new URLSearchParams(params).toString();
    const url = `${API_BASE_URL}/api/end_events${queryString ? `?${queryString}` : ''}`;
    const response = await fetch(url, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
    });
    if (!response.ok) {
      const errorText = await response.text();
      throw new Error(`HTTP error! status: ${response.status}, body: ${errorText}`);
    }
    const data = await response.json();
    return data;
  } catch (error) {
    throw error;
  }
};

export const downloadExcel = async (params = {}) => {
  try {
    const response = await apiRequest(`${API_ENDPOINTS.EXPORT_EXCEL}?${new URLSearchParams(params)}`, {
      method: "GET",
      responseType: "blob",
    });

    const blob = new Blob([response], {
      type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
    });

    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const today = new Date().toISOString().split("T")[0];
    a.download = `system_event_excel_${today}.xlsx`; 

    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const downloadPDF = async (params = {}) => {
  try {
    const response = await apiRequest(`${API_ENDPOINTS.EXPORT_PDF}?${new URLSearchParams(params)}`, {
      method: "GET",
      responseType: "blob",
    });

    const blob = new Blob([response], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;

    const today = new Date().toISOString().split("T")[0];
    a.download = `system_event_pdf_${today}.pdf`;

    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export const downloadEventPdf = async (uuid) => {
  try {
    const response = await apiRequest(API_ENDPOINTS.EXPORT_MACHINE_PDF(uuid), {
      method: "GET",
      responseType: "blob",
    });
    const blob = new Blob([response], { type: 'application/pdf' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `event_report_${uuid}.pdf`;
    document.body.appendChild(a);
    a.click();
    window.URL.revokeObjectURL(url);
    document.body.removeChild(a);

    return { success: true };
  } catch (error) {
    throw error;
  }
};

export default API_BASE_URL