import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Package, Clock, CheckCircle2, Send, XCircle, FileText, Plus, ArrowRight } from "lucide-react"
import { useWarehouseRequests } from "@/lib/api-hooks";
import axios from "axios";
import { useState, useEffect } from "react";
import { useRouter } from "next/router";

const warehouseModules = [
	{
		name: "Solicitudes Bodega",
		icon: Package,
		count: null,
		status: "default",
		href: "#",
	},
	{
		name: "Pendientes",
		icon: Clock,
		count: 197,
		status: "warning",
		href: "#",
	},
	{
		name: "Aprobadas",
		icon: CheckCircle2,
		count: 45,
		status: "info",
		href: "#",
	},
	{
		name: "Despachadas",
		icon: Send,
		count: 7,
		status: "success",
		href: "#",
	},
	{
		name: "Terminadas",
		icon: CheckCircle2,
		count: null,
		status: "success",
		href: "#",
	},
	{
		name: "Rechazadas",
		icon: XCircle,
		count: null,
		status: "destructive",
		href: "#",
	},
	{
		name: "Repuesto de Solicitudes",
		icon: FileText,
		count: null,
		status: "default",
		href: "#",
	},
	{
		name: "Items Adicionales",
		icon: Plus,
		count: null,
		status: "default",
		href: "#",
	},
]

// Tipado para solicitudes de bodega
interface WarehouseRequest {
  id: number;
  nombre: string;
  tipo: string;
  estado: string;
}

export function WarehouseRequestsSection() {
	const token = typeof window !== "undefined" ? localStorage.getItem("token") : null;
	const router = useRouter();
	const requests: WarehouseRequest[] = useWarehouseRequests(token) as WarehouseRequest[];
	const [form, setForm] = useState({ nombre: "", tipo: "", estado: "" });
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState("");

	useEffect(() => {
		if (!token) {
			router.push("/login");
		}
	}, [token, router]);

	const handleChange = (e) => {
		setForm({ ...form, [e.target.name]: e.target.value });
	};

	const handleSubmit = async (e) => {
		e.preventDefault();
		setLoading(true);
		setError("");
		try {
			await axios.post("http://localhost:8000/api/warehouse-requests", form, {
				headers: { Authorization: `Bearer ${token}` }
			});
			window.location.reload();
		} catch (err) {
			setError("Error al crear la solicitud");
		}
		setLoading(false);
	};

	// Editar solicitud
	const [editId, setEditId] = useState<number | null>(null);
	const [editForm, setEditForm] = useState({ nombre: "", tipo: "", estado: "" });
	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditForm({ ...editForm, [e.target.name]: e.target.value });
	};
	const handleEdit = (id: number, req: WarehouseRequest) => {
		setEditId(id);
		setEditForm({
			nombre: req.nombre || "",
			tipo: req.tipo || "",
			estado: req.estado || ""
		});
	};
	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault();
		if (!editId) return;
		setLoading(true);
		setError("");
		try {
			await axios.put(`http://localhost:8000/api/warehouse-requests/${editId}`, editForm, {
				headers: { Authorization: `Bearer ${token}` }
			});
			window.location.reload();
		} catch (err) {
			setError("Error al editar la solicitud");
		}
		setLoading(false);
	};

	// Eliminar solicitud
	const handleDelete = async (id: number) => {
		if (!window.confirm("¿Seguro que deseas eliminar esta solicitud?")) return;
		try {
			await axios.delete(`http://localhost:8000/api/warehouse-requests/${id}`, {
				headers: { Authorization: `Bearer ${token}` }
			});
			window.location.reload();
		} catch (err) {
			alert("Error al eliminar la solicitud");
		}
	};

	return (
		<section id="warehouse-requests">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight">Solicitudes de Bodega</h2>
					<p className="text-sm text-muted-foreground mt-1">Gestiona las solicitudes de materiales y equipos</p>
				</div>
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					Nueva Solicitud
				</Button>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{warehouseModules.map((module) => (
					<Card key={module.name} className="group hover:shadow-md transition-all cursor-pointer">
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-lg ${
											module.status === "warning"
												? "bg-warning/10 text-warning"
												: module.status === "success"
													? "bg-success/10 text-success"
													: module.status === "info"
														? "bg-info/10 text-info"
														: module.status === "destructive"
															? "bg-destructive/10 text-destructive"
															: "bg-muted text-muted-foreground"
										}`}
									>
										<module.icon className="h-5 w-5" />
									</div>
									<div>
										<h3 className="font-medium text-sm leading-tight">{module.name}</h3>
										{module.count !== null && <p className="text-2xl font-bold mt-1">{module.count}</p>}
									</div>
								</div>
								<ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			<form onSubmit={handleSubmit} className="space-y-4 max-w-lg mx-auto mt-8 bg-white p-6 rounded shadow">
				<input name="nombre" value={form.nombre} onChange={handleChange} placeholder="Nombre" />
				<input name="tipo" value={form.tipo} onChange={handleChange} placeholder="Tipo" />
				<input name="estado" value={form.estado} onChange={handleChange} placeholder="Estado" />
				<button type="submit" disabled={loading}>Guardar Solicitud</button>
				{error && <div className="text-red-500">{error}</div>}
			</form>

			<ul className="mt-8">
        {requests.map((req) => (
          <li key={req.id} className="mb-2 p-2 border rounded">
            <div>
              <strong>{req.nombre}</strong> - {req.tipo} - {req.estado}
            </div>
            <button onClick={() => handleEdit(req.id, req)} className="mr-2">Editar</button>
            <button onClick={() => handleDelete(req.id)} className="text-red-500">Eliminar</button>
          </li>
        ))}
      </ul>
      {editId && (
        <form onSubmit={handleEditSubmit} className="space-y-2 p-4 border rounded mb-4">
          <input name="nombre" value={editForm.nombre} onChange={handleEditChange} placeholder="Nombre" />
          <input name="tipo" value={editForm.tipo} onChange={handleEditChange} placeholder="Tipo" />
          <input name="estado" value={editForm.estado} onChange={handleEditChange} placeholder="Estado" />
          <button type="submit" disabled={loading}>Guardar Cambios</button>
          <button type="button" onClick={() => setEditId(null)}>Cancelar</button>
          {error && <div className="text-red-500">{error}</div>}
        </form>
      }
		</section>
	)
}
