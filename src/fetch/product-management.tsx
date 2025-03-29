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

export const getProducts = async (data = {}, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/products/`, {
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${userData.token}`,
        ...headers
      },
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching products:', response || 'Unknown error');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching products:', error);
    }
    return null;
  }
}

export const getProduct = async (data: { id: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.get<ResponseData>(`${API_URL}/api/v1/products/${data.id}`, {
        headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${userData.token}`,
            ...headers
        },
    });
    if (response.data && response.data.status_code === 200) {
      return response.data.data;
    } else {
      console.error('Error fetching product:', response || 'Unknown error');
      return null;
    }
  } catch (error) {
    if (axios.isAxiosError(error)) {
      return { errors : error.response?.data.errors };
    } else {
      console.error('Unexpected error fetching product:', error);
    }
    return null;
  }
}

export const createProduct = async (productData: { id?: string, name: string, description: string, price: number, category: number, stock : number, image: string | File }, headers = {}) => {
  try {
    const data = new FormData();
    data.append('name', productData.name);
    data.append('description', productData.description);
    data.append('price', productData.price.toString());
    data.append('category', productData.category.toString());
    data.append('stock', productData.stock.toString());

    // Handle image as string or File
    if (productData.image instanceof File) {
      data.append('image', productData.image);
    } else if (typeof productData.image === 'string' && productData.image) {
      data.append('image', productData.image);
    }
    
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.post<ResponseData>(`${API_URL}/api/v1/products/`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
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

export const updateProduct = async (productData: { id: string, name: string, description: string, price: number, category: number, image: string | File }, headers = {}) => {
  try {
    if (!productData.id) {
      return { errors: 'Product ID is required for update' };
    }
    
    const data = new FormData();
    data.append('id', productData.id);
    data.append('name', productData.name);
    data.append('description', productData.description);
    data.append('price', productData.price.toString());
    data.append('category', productData.category.toString());
    
    // Handle image as string or File
    if (productData.image instanceof File) {
      data.append('image', productData.image);
    } else if (typeof productData.image === 'string' && productData.image) {
      data.append('image', productData.image);
    }

    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.put<ResponseData>(`${API_URL}/api/v1/products/`, data, {
        headers: {
            'Content-Type': 'multipart/form-data',
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

export const deleteProduct = async (data: { id: string }, headers = {}) => {
  try {
    const API_URL = import.meta.env.VITE_SERVER_URL || 'http://localhost:4000';
    const userData = JSON.parse(localStorage.getItem('user_data') ?? '{}');
    if(!userData.token) {
      console.error('Request to server failed, token not provided')
      return;
    }
    const response = await axios.delete<ResponseData>(`${API_URL}/api/v1/products/${data.id}`, {
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