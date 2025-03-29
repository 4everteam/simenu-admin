import axios from "axios";

interface ResponseData {
  data: any;
  message: string;
  status_code: number;
}

// interface APIResponse {
//   status: string;
//   data?: ResponseData;
// }

export const getTables = async (data = {}, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/tables/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`,
        ...headers
      },
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching tables:', response || 'Unknown error');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching tables:', error);
    }
    return null;
  }
}

export const getTable = async (data: { code: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/tables/${data.code}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        },
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching tables:', response || 'Unknown error');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching tables:', error);
    }
    return null;
  }
}

export const getQRTable = async (data: { code: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/tables/qr-code/${data.code}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        }
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching tables:', response || 'Unknown error');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching tables:', error);
    }
    return null;
  }
}

export const requestQRTable = async (data: { code: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.post<ResponseData>(`${API_URL}/api/v1/tables/qr-code`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        }
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error requesting QR for table:', response || 'Unknown error');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error requesting QR for table:', error);
    }
    return null;
  }
}

export const createTable = async (tableData: { code: string, status: string, capacity: number }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.post<ResponseData>(`${API_URL}/api/v1/tables/`, tableData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        },
    });
    
    // The API returns a nested structure
    if (response.data && response.data.status_code === 200) {
      return true;
    } else {
      console.error('Error creating table:', response.data?.data?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error creating table:', error);
    }
    return false;
  }
}

export const updateTable = async (tableData: { id: number, code: string, status: string, capacity: number }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.put<ResponseData>(`${API_URL}/api/v1/tables/`, tableData, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        },
    });

    // The API returns a nested structure
    if (response.data && response.data.status_code === 200) {
      return true;
    } else {
      console.error('Error updating table:', response.data?.data?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {errors : error.response?.data.errors};
    } else {
      console.error('Unexpected error updating table:', error);
    }
    return false;
  }
}

export const deleteTable = async (data: { code: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.delete<ResponseData>(`${API_URL}/api/v1/tables/${data.code}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        },
    });

    // The API returns a nested structure
    if (response.data && response.data.status_code === 200) {
      return true;
    } else {
      console.error('Error deleting table:', response.data?.data?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {errors : error.response?.data.errors};
    } else {
      console.error('Unexpected error deleting table:', error);
    }
    return false;
  }
}