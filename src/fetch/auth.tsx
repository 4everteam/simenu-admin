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

export const getAuthURL = async (headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/auth/url`, {
        headers: {
            'Content-Type': 'application/json',
           ...headers
        },
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching auth url:', response || 'Unknown error');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching auth url:', error);
    }
    return null;
  }
}

export const getAuthToken= async (data: { code: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/auth/token${data.code}`, {
        headers: {
            'Content-Type': 'application/www-form-urlencoded',
            ...headers
        },
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error getting auth token:', response || 'Unknown error');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error getting auth token:', error);
    }
    return null;
  }
}

export const isLoggedIn = async (headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/auth/check`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        },
    });
    
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error checking auth:', response.data?.message || 'Unknown error');
      return;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error checking auth:', error);
    }
    return;
  }
}

export const getUser= async (data: { id: number }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/users/${data.id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        },
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching user:', response || 'Unknown error');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching user:', error);
    }
    return null;
  }
}

export const login = async (data: { email: string, password: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const response = await axios.post<ResponseData>(`${API_URL}/api/v1/users/login`, data, {
        headers: {
            'Content-Type': 'application/json',
            ...headers
        },
    });
    
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error creating product:', response.data?.message || 'Unknown error');
      return;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error creating product:', error);
    }
    return;
  }
}

export const updateProfile = async (data: { id: number, name: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.put<ResponseData>(`${API_URL}/api/v1/users/`, data, {
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