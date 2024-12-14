import { axios } from "./axios";

const API_BASE_URL = 'https://sponge-plant-be.onrender.com';
const API_V1 = "api/v1";
const URL = `${API_BASE_URL}/${API_V1}`;


const getAllMachine = () => {
  return axios.get(`${URL}/machine`);
};
const getAllMaterial = () => {
  return axios.get(`${URL}/material`);
};

const addAndEditMaterial = (data) => {
  return axios.post(`${URL}/material`, data);
};
const addAndEditMachine = (data) => {
  return axios.post(`${URL}/machine`, data);
};
const postMachineMaterial = (data) => {
  return axios.post(`${URL}/machine-material`, data);
};

export const APIS = {
  getAllMachine,
  getAllMaterial,
  addAndEditMaterial,
  addAndEditMachine,
  postMachineMaterial,
};
