import axios from "axios";
import { toast } from "react-toastify";

axios.defaults.baseURL = "http://localhost:8080";
axios.defaults.headers.post["Content-Type"] = "application/json";

export const getToken = () => {
  return sessionStorage.getItem("token");
};

export const setToken = (token) => {
  sessionStorage.setItem("token", token);
};

export const refreshToken = async () => {
  try {
    const response = await request("POST", "/refresh-token", {});
    if (response.status === 200) {
      setToken(response.data);
    }
  }catch (error) {
    if(error.response.status === 401){
      window.location.href = '/login';
      sessionStorage.setItem('loginExpired', 'true');
    }else
      toast.error('Something went wrong');
  }
}

export const request = (method, url, data) => {
  let headers = {};
  if(getToken() !== null){
    headers = {
      Authorization: `Bearer ${getToken()}`
    }
  }
  return axios({
    method: method,
    headers: headers,
    url: url,
    data: data
  });
}