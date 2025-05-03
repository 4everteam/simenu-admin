import axios from "axios";

interface ResponseData {
  data: any;
  message: string;
  status_code: number;
}

const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
const getToken = () => {
  const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
  return userData.token;
};

export const getSalesReport = async (params: { period: 'daily' | 'weekly' | 'monthly', start_date: string, end_date: string }, headers = {}) => {
  const token = getToken();
  if (!token) {
    console.error('Request to server failed, token not provided');
    return;
  }
  try {
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/reports/sales`, {
      params,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers
      },
    });
    if (response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching sales report:', response.data.message);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors: error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching sales report:', error);
      return null;
    }
  }
};

export const getPopularMenu = async (params: { start_date: string, end_date: string, limit?: number }, headers = {}) => {
  const token = getToken();
  if (!token) {
    console.error('Request to server failed, token not provided');
    return;
  }
  try {
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/reports/popular-menu`, {
      params,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers
      },
    });
    if (response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching popular menu:', response.data.message);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors: error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching popular menu:', error);
      return null;
    }
  }
};

export const getPeakHours = async (params: { start_date: string, end_date: string, interval?: number }, headers = {}) => {
  const token = getToken();
  if (!token) {
    console.error('Request to server failed, token not provided');
    return;
  }
  try {
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/reports/peak-hours`, {
      params,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers
      },
    });
    if (response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching peak hours:', response.data.message);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors: error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching peak hours:', error);
      return null;
    }
  }
};

export const getTableUsage = async (params: { start_date: string, end_date: string, table_id?: string }, headers = {}) => {
  const token = getToken();
  if (!token) {
    console.error('Request to server failed, token not provided');
    return;
  }
  try {
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/reports/table-usage`, {
      params,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`,
        ...headers
      },
    });
    if (response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching table usage:', response.data.message);
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors: error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching table usage:', error);
      return null;
    }
  }
};
