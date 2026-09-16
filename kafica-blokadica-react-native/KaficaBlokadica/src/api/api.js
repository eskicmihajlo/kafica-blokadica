import axios from 'axios';
import * as SecureStore from 'expo-secure-store';

const API = axios.create({
  baseURL: '',
  timeout: 5000,
  headers: {
    "ngrok-skip-browser-warning": "true"
  }
 
});


API.interceptors.request.use(
  async (config) => {
    const token = await SecureStore.getItemAsync('userToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

export async function sendPushTokenToBackend(token) {
    try {
        await API.post("/push/register", { token });
        console.log("Push token sent to backend successfully");
    } catch (error) {
        console.log("Failed to send push token:", error.message);
    }
}

export default API;