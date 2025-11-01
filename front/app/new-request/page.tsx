"use client"

import { DashboardLayout } from "@/components/dashboard-layout"
import { RequestForm } from "@/components/request-form"
import { useReports } from "@/lib/api-hooks"
import axios from "axios"
import { useState, useEffect } from "react"
import { useRouter } from "next/router"

const requestFields = [
	{
		name: "cliente",
		label: "Cliente",
		type: "select" as const,
		options: ["IPS Salud Sura", "AY DX Salud Sura", "Ayudas Diagnósticas"],
		required: true,
	},
	{
		name: "sede",
		label: "Sede",
		type: "select" as const,
		options: ["Centro", "Chipichape", "Norte", "Sur"],
		required: true,
	},
	{
		name: "equipo",
		label: "Equipo",
		type: "select" as const,
		options: [
			"Glucómetro",
			"Pulsoxímetro",
			"Monitor de signos vitales",
			"Unidad portátil",
		],
		required: true,
	},
	{ name: "idEquipo", label: "ID Equipo", type: "text" as const, required: true },
	{ name: "serie", label: "Serie", type: "text" as const, required: true },
	{
		name: "tipoServicio",
		label: "Tipo de Servicio",
		type: "select" as const,
		options: ["Correctivo", "Preventivo", "Instalación", "Informe"],
		required: true,
	},
	{
		name: "prioridad",
		label: "Prioridad",
		type: "select" as const,
		options: ["Alta", "Media", "Baja"],
		required: true,
	},
	{
		name: "fechaSolicitud",
		label: "Fecha de Solicitud",
		type: "date" as const,
		required: true,
	},
	{
		name: "descripcion",
		label: "Descripción del Problema",
		type: "textarea" as const,
		required: true,
	},
	{ name: "observaciones", label: "Observaciones", type: "textarea" as const },
]

// Tipado para informes
interface Report {
	id: number
	titulo: string
	fecha: string
	estado: string
}

export default function NewRequestPage() {
	const token = localStorage.getItem("token")
	const reports: Report[] = useReports(token) as Report[]
	const [form, setForm] = useState({
		titulo: "",
		fecha: "",
		estado: "",
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const router = useRouter()

	useEffect(() => {
		if (!token) {
			router.push("/login")
		}
	}, [token, router])

	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}

	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError("")
		try {
			await axios.post(
				"http://localhost:8000/api/reports",
				form,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			)
			window.location.reload()
		} catch (err) {
			setError("Error al crear el informe")
		}
		setLoading(false)
	}

	// Editar informe
	const [editId, setEditId] = useState<number | null>(null)
	const [editForm, setEditForm] = useState({ titulo: "", fecha: "", estado: "" })
	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditForm({ ...editForm, [e.target.name]: e.target.value })
	}
	const handleEdit = (id: number, report: Report) => {
		setEditId(id)
		setEditForm({
			titulo: report.titulo || "",
			fecha: report.fecha || "",
			estado: report.estado || "",
		})
	}
	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editId) return
		setLoading(true)
		setError("")
		try {
			await axios.put(
				`http://localhost:8000/api/reports/${editId}`,
				editForm,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			)
			window.location.reload()
		} catch (err) {
			setError("Error al editar el informe")
		}
		setLoading(false)
	}

	// Eliminar informe
	const handleDelete = async (id: number) => {
		if (!window.confirm("¿Seguro que deseas eliminar este informe?")) return
		try {
			await axios.delete(`http://localhost:8000/api/reports/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			window.location.reload()
		} catch (err) {
			alert("Error al eliminar el informe")
		}
	}

	return (
		<DashboardLayout>
			<RequestForm
				title="Nueva Solicitud de Servicio"
				fields={requestFields}
				onSubmit={(data) => console.log("Form submitted:", data)}
				onCancel={() => window.history.back()}
			/>
			<section id="reports">
				<h2 className="text-2xl font-semibold mb-4">Informes</h2>
				<ul>
					{reports.map((report) => (
						<li key={report.id} className="mb-2 p-2 border rounded">
							<div>
								<strong>{report.titulo}</strong> - {report.fecha} -{" "}
								{report.estado}
							</div>
							<button
								onClick={() => handleEdit(report.id, report)}
								className="mr-2"
							>
								Editar
							</button>
							<button
								onClick={() => handleDelete(report.id)}
								className="text-red-500"
							>
								Eliminar
							</button>
						</li>
					))}
				</ul>
				<form
					onSubmit={handleSubmit}
					className="space-y-4 max-w-lg mx-auto mt-8 bg-white p-6 rounded shadow"
				>
					<input
						name="titulo"
						value={form.titulo}
						onChange={handleChange}
						placeholder="Título"
					/>
					<input
						name="fecha"
						type="date"
						value={form.fecha}
						onChange={handleChange}
						placeholder="Fecha"
					/>
					<input
						name="estado"
						value={form.estado}
						onChange={handleChange}
						placeholder="Estado"
					/>
					<button type="submit" disabled={loading}>
						Guardar Informe
					</button>
					{error && <div className="text-red-500">{error}</div>}
				</form>
				{editId && (
					<form
						onSubmit={handleEditSubmit}
						className="space-y-2 p-4 border rounded mb-4"
					>
						<input
							name="titulo"
							value={editForm.titulo}
							onChange={handleEditChange}
							placeholder="Título"
						/>
						<input
							name="fecha"
							type="date"
							value={editForm.fecha}
							onChange={handleEditChange}
							placeholder="Fecha"
						/>
						<input
							name="estado"
							value={editForm.estado}
							onChange={handleEditChange}
							placeholder="Estado"
						/>
						<button type="submit" disabled={loading}>
							Guardar Cambios
						</button>
						<button type="button" onClick={() => setEditId(null)}>
							Cancelar
						</button>
						{error && <div className="text-red-500">{error}</div>}
					</form>
				)}
			</section>
		</DashboardLayout>
	)
}
