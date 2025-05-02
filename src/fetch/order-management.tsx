import axios from "axios";

interface ResponseData {
  data: any;
  message: string;
  status_code: number;
}

interface dataOrderMenu {
  on_behalf: string;
  table_id: string;
  items : {
    product_id: string;
    quantity: number;
    notes: string;
  }[];
}

export const getOrders = async (data = {}, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/orders/`, {
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

export const getOrderDetail = async (data: { id: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/orders/${data.id}`, {
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

export const getOrderItems = async (data: { code: string }, headers = {}) => {
    try {
      const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
      const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
      if(!userData.token) {
        console.error('Request to server failed, token not provided')
        return;
      }
      const response = await axios.get<ResponseData>(`${API_URL}/api/v1/orders/table/${data.code}`, {
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

export const getOrderItemsByOrderId = async (data: { id: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/orders/order/${data.id}`, {
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

export const updateOrderItemStatus = async (data: { itemId: number, newStatus: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.put<ResponseData>(`${API_URL}/api/v1/orders/status`, data, {
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

export const orderMenu = async (data : dataOrderMenu, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const response = await axios.post<ResponseData>(`${API_URL}/api/v1/orders`, data, {
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error checking products', response || 'Unknown error');
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

export const deleteOrder = async (data : { id: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.delete<ResponseData>(`${API_URL}/api/v1/orders/${data.id}`, {
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