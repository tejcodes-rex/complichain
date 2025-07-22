import axios from "axios";


const API = axios.create({
  baseURL: import.meta.env.VITE_API_URL || "http://localhost:5000/api",
});


API.interceptors.request.use((config) => {
  const token = localStorage.getItem("token");
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});


export const login = async (username, password) => {
  const res = await API.post("/auth/login", { username, password });
  const { token } = res.data;
  localStorage.setItem("token", token);
  return token;
};


export const fetchLogs = async () => {
  const res = await API.get("/logs");
  return res.data;
};

export const fetchLogById = async (id) => {
  const res = await API.get(`/logs/${id}`);
  return res.data.data;  
};

export const ingestLog = async (log) => {
  const res = await API.post("/logs/ingest", log);
  return res.data;
};

export const deleteLog = async (id) => {
  const res = await API.delete(`/logs/${id}`);
  return res.data;
};


export const getStats = async () => {
  const res = await API.get("/logs/stats");
  return res.data;
};

export const getTrends = async () => {
  const res = await API.get("/logs/trends");
  return res.data;
};

export const getViolationBreakdown = async () => {
  const res = await API.get("/logs/violations/breakdown");
  return res.data;
};

export const getRecentViolations = async () => {
  const res = await API.get("/logs/violations/recent");
  return res.data;
};

export default API;
