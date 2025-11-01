"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { DataTable } from "@/components/data-table"
import { useVisits } from "@/lib/api-hooks";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const columns = [
  { key: "id", label: "Id", sortable: true },
  { key: "aviso", label: "Aviso", sortable: true },
  { key: "servicio", label: "Servicio", sortable: true },
  { key: "creacion", label: "Creación", sortable: true },
  { key: "equipo", label: "Equipo", sortable: true },
  { key: "idEquipo", label: "Id Equipo", sortable: true },
  { key: "estado", label: "Estado", sortable: true },
  { key: "sede", label: "Sede", sortable: true },
  { key: "serie", label: "Serie", sortable: true },
]

// Tipado para visitas
interface Visit {
  id: number;
  sede: string;
  fecha: string;
  tecnico: string;
  estado: string;
}

export default function WarehouseRequestsPage() {
  const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
  const router = useRouter();
  const visits: Visit[] = useVisits(token) as Visit[];
  const [form, setForm] = useState({ sede: "", fecha: "", tecnico: "", estado: "" });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!token) {
      router.push("/login");
    }
  }, [token, router]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");
    try {
      await axios.post("http://localhost:8000/api/visits", form, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload();
    } catch (err) {
      setError("Error al crear la visita");
    }
    setLoading(false);
  };

  // Editar visita
  const [editId, setEditId] = useState<number | null>(null);
  const [editForm, setEditForm] = useState({ sede: "", fecha: "", tecnico: "", estado: "" });
  const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setEditForm({ ...editForm, [e.target.name]: e.target.value });
  };
  const handleEdit = (id: number, visit: Visit) => {
    setEditId(id);
    setEditForm({
      sede: visit.sede || "",
      fecha: visit.fecha || "",
      tecnico: visit.tecnico || "",
      estado: visit.estado || ""
    });
  };
  const handleEditSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editId) return;
    setLoading(true);
    setError("");
    try {
      await axios.put(`http://localhost:8000/api/visits/${editId}`, editForm, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload();
    } catch (err) {
      setError("Error al editar la visita");
    }
    setLoading(false);
  };

  // Eliminar visita
  const handleDelete = async (id: number) => {
    if (!window.confirm("¿Seguro que deseas eliminar esta visita?")) return;
    try {
      await axios.delete(`http://localhost:8000/api/visits/${id}`, {
        headers: { Authorization: `Bearer ${token}` }
      });
      window.location.reload();
    } catch (err) {
      alert("Error al eliminar la visita");
    }
  };

  return (
    <DashboardLayout>
      <DataTable
        title="Solicitudes"
        columns={columns}
        data={visits}
        totalRecords={312541}
        onView={(row) => console.log("View", row)}
        onEdit={(row) => console.log("Edit", row)}
      />
      <form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto mt-8 bg-white p-6 rounded shadow">
        <input name="sede" value={form.sede} onChange={handleChange} placeholder="Sede" />
        <input name="fecha" type="date" value={form.fecha} onChange={handleChange} placeholder="Fecha" />
        <input name="tecnico" value={form.tecnico} onChange={handleChange} placeholder="Técnico" />
        <input name="estado" value={form.estado} onChange={handleChange} placeholder="Estado" />
        <button type="submit" disabled={loading}>Guardar Visita</button>
        {error && <div className="text-red-500">{error}</div>}
      </form>
      <section id="visits">
        <h2 className="text-2xl font-semibold mb-4">Visitas</h2>
        <ul>
          {visits.map((visit) => (
            <li key={visit.id} className="mb-2 p-2 border rounded">
              <div>
                <strong>{visit.sede}</strong> - {visit.fecha} - {visit.tecnico} - {visit.estado}
              </div>
              <button onClick={() => handleEdit(visit.id, visit)} className="mr-2">Editar</button>
              <button onClick={() => handleDelete(visit.id)} className="text-red-500">Eliminar</button>
            </li>
          ))}
        </ul>
        {editId && (
          <form onSubmit={handleEditSubmit} className="space-y-2 p-4 border rounded mb-4">
            <input name="sede" value={editForm.sede} onChange={handleEditChange} placeholder="Sede" />
            <input name="fecha" type="date" value={editForm.fecha} onChange={handleEditChange} placeholder="Fecha" />
            <input name="tecnico" value={editForm.tecnico} onChange={handleEditChange} placeholder="Técnico" />
            <input name="estado" value={editForm.estado} onChange={handleEditChange} placeholder="Estado" />
            <button type="submit" disabled={loading}>Guardar Cambios</button>
            <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
            {error && <div className="text-red-500">{error}</div>}
          </form>
        )}
      </section>
    </DashboardLayout>
  )
}
