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

export const getInventories = async (data = {}, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/inventory/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`,
        ...headers
      },
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching categories:', response || 'Unknown error');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching categories:', error);
    }
    return null;
  }
}

export const getInventory = async (data: { id: number }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/inventory/${data.id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        },
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching category:', response || 'Unknown error');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching category:', error);
    }
    return null;
  }
}

export const createInventory = async (data: { product_id: string, stock_qty : number, alert_threshold: number }, headers = {}) => {
  try {
    console.table(data)
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.post<ResponseData>(`${API_URL}/api/v1/inventory/`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        },
    });
    
    if (response.data && response.data.status_code === 200) {
      return true;
    } else {
      console.error('Error creating product:', response.data?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error creating product:', error);
    }
    return false;
  }
}

export const updateInventory = async (data: { id: number, product_id: string, stock_qty : number, alert_threshold: number }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.put<ResponseData>(`${API_URL}/api/v1/inventory/`, data, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        },
    });

    if (response.data && response.data.status_code === 200) {
      return true;
    } else {
      console.error('Error updating product:', response.data?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {errors : error.response?.data.errors};
    } else {
      console.error('Unexpected error updating product:', error);
    }
    return false;
  }
}

export const deleteInventory = async (data: { id: number }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.delete<ResponseData>(`${API_URL}/api/v1/inventory/${data.id}`, {
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
      console.error('Error deleting product:', response.data?.data?.message || 'Unknown error');
      return false;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return {errors : error.response?.data.errors};
    } else {
      console.error('Unexpected error deleting product:', error);
    }
    return false;
  }
}