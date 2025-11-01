// Este archivo centraliza la lógica de conexión entre el frontend V0 y el backend Laravel para todos los módulos principales.
// Puedes importar y usar estos hooks en los componentes de cada módulo para obtener y manipular datos reales.

import { useEffect, useState } from "react";
import axios from "axios";

const API_URL = "http://localhost:8000/api";

// --- Cotizaciones ---
export function useQuotes(token) {
  const [quotes, setQuotes] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/quotes`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setQuotes(res.data.data))
    .catch(err => setQuotes([]));
  }, [token]);
  return quotes;
}

// --- Solicitudes de Bodega ---
export function useWarehouseRequests(token) {
  const [requests, setRequests] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/warehouse-requests`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setRequests(res.data.data))
    .catch(err => setRequests([]));
  }, [token]);
  return requests;
}

// --- Órdenes de Servicio ---
export function useServiceOrders(token) {
  const [orders, setOrders] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/service-orders`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setOrders(res.data.data))
    .catch(err => setOrders([]));
  }, [token]);
  return orders;
}

// --- Visitas ---
export function useVisits(token) {
  const [visits, setVisits] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/visits`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setVisits(res.data.data))
    .catch(err => setVisits([]));
  }, [token]);
  return visits;
}

// --- Informes ---
export function useReports(token) {
  const [reports, setReports] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/reports`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setReports(res.data.data))
    .catch(err => setReports([]));
  }, [token]);
  return reports;
}

// --- Configuración General ---
// --- Clientes ---
export function useClients(token) {
  const [clients, setClients] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/clients`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setClients(res.data.data))
    .catch(err => setClients([]));
  }, [token]);
  return clients;
}

// --- Sedes ---
export function useLocations(token) {
  const [locations, setLocations] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/locations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setLocations(res.data.data))
    .catch(err => setLocations([]));
  }, [token]);
  return locations;
}

// --- Equipos ---
// --- Usuarios ---
// --- Analistas ---
export function useAnalysts(token) {
  const [analysts, setAnalysts] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/analysts`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setAnalysts(res.data.data))
    .catch(err => setAnalysts([]));
  }, [token]);
  return analysts;
}

// --- Técnicos ---
export function useTechnicians(token) {
  const [technicians, setTechnicians] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/technicians`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setTechnicians(res.data.data))
    .catch(err => setTechnicians([]));
  }, [token]);
  return technicians;
}

// --- Coordinadores ---
export function useCoordinators(token) {
  const [coordinators, setCoordinators] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/coordinators`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setCoordinators(res.data.data))
    .catch(err => setCoordinators([]));
  }, [token]);
  return coordinators;
}

// --- Comerciales ---
export function useSales(token) {
  const [sales, setSales] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/sales`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setSales(res.data.data))
    .catch(err => setSales([]));
  }, [token]);
  return sales;
}

// --- Administradores ---
export function useAdmins(token) {
  const [admins, setAdmins] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/admins`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setAdmins(res.data.data))
    .catch(err => setAdmins([]));
  }, [token]);
  return admins;
}

// --- Permisos Especiales ---
export function usePermissions(token) {
  const [permissions, setPermissions] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/permissions`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setPermissions(res.data.data))
    .catch(err => setPermissions([]));
  }, [token]);
  return permissions;
}

// --- Usuarios vs Clientes ---
export function useUserClients(token) {
  const [userClients, setUserClients] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/user-clients`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUserClients(res.data.data))
    .catch(err => setUserClients([]));
  }, [token]);
  return userClients;
}

// --- Usuarios vs Sedes ---
export function useUserLocations(token) {
  const [userLocations, setUserLocations] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/user-locations`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUserLocations(res.data.data))
    .catch(err => setUserLocations([]));
  }, [token]);
  return userLocations;
}
export function useUsers(token) {
  const [users, setUsers] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/users`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setUsers(res.data.data))
    .catch(err => setUsers([]));
  }, [token]);
  return users;
}
export function useEquipment(token) {
  const [equipment, setEquipment] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/equipment`, {
      headers: { Authorization: `Bearer ${token}` }
    })
    .then(res => setEquipment(res.data.data))
    .catch(err => setEquipment([]));
  }, [token]);
  return equipment;
}
export function useGeneralConfig(token, tab) {
  const [config, setConfig] = useState([]);
  useEffect(() => {
    axios.get(`${API_URL}/general-config`, {
      headers: { Authorization: `Bearer ${token}` },
      params: { tab }
    })
    .then(res => setConfig(res.data.data))
    .catch(err => setConfig([]));
  }, [token, tab]);
  return config;
}

// --- Logout ---
export function logoutUser() {
  const token = localStorage.getItem("token");
  return axios.post("http://localhost:8000/api/auth/logout", {}, {
    headers: { Authorization: `Bearer ${token}` }
  }).then(() => {
    localStorage.removeItem("token");
    window.location.reload();
  });
}
