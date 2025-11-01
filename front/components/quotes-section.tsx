import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { FileText, Clock, CheckCircle2, XCircle, Plus, ArrowRight } from "lucide-react"
import { useQuotes } from "@/lib/api-hooks";
import axios from "axios";
import { useState, useEffect } from "react"
import { useRouter } from "next/router"

const quotesModules = [
	{
		name: "Cotizaciones",
		icon: FileText,
		count: null,
		status: "default",
	},
	{
		name: "Pendientes",
		icon: Clock,
		count: 268,
		status: "warning",
	},
	{
		name: "Aprobadas",
		icon: CheckCircle2,
		count: null,
		status: "success",
	},
	{
		name: "Rechazadas",
		icon: XCircle,
		count: null,
		status: "destructive",
	},
]

// Tipado para cotizaciones
interface Quote {
  id: number;
  cliente: string;
  fecha: string;
  monto: string;
  estado: string;
  validez: string;
}

export default function QuotesSection() {
	const token = typeof window !== "undefined" ? localStorage.getItem("token") : null
	const router = useRouter()
	const quotes: Quote[] = useQuotes(token) as Quote[];
	const [form, setForm] = useState({
		cliente: "",
		fecha: "",
		monto: "",
		estado: "",
		validez: "",
	})
	const [loading, setLoading] = useState(false)
	const [error, setError] = useState("")
	const [editId, setEditId] = useState<string | null>(null)
	const [editForm, setEditForm] = useState({
		cliente: "",
		fecha: "",
		monto: "",
		estado: "",
		validez: "",
	})

	useEffect(() => {
		if (!token) {
			router.push("/login")
		}
	}, [token, router])

	// Crear cotización
	const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setForm({ ...form, [e.target.name]: e.target.value })
	}
	const handleSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		setLoading(true)
		setError("")
		try {
			await axios.post(
				"http://localhost:8000/api/quotes",
				form,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			)
			// Opcional: recargar cotizaciones
			window.location.reload()
		} catch (err) {
			setError("Error al crear la cotización")
		}
		setLoading(false)
	}

	// Editar cotización
	const handleEditChange = (e: React.ChangeEvent<HTMLInputElement>) => {
		setEditForm({ ...editForm, [e.target.name]: e.target.value })
	}
	const handleEdit = (id: string, quote: any) => {
		setEditId(id)
		setEditForm({
			cliente: quote.cliente || "",
			fecha: quote.fecha || "",
			monto: quote.monto || "",
			estado: quote.estado || "",
			validez: quote.validez || "",
		})
	}
	const handleEditSubmit = async (e: React.FormEvent) => {
		e.preventDefault()
		if (!editId) return
		setLoading(true)
		setError("")
		try {
			await axios.put(
				`http://localhost:8000/api/quotes/${editId}`,
				editForm,
				{
					headers: { Authorization: `Bearer ${token}` },
				}
			)
			window.location.reload()
		} catch (err) {
			setError("Error al editar la cotización")
		}
		setLoading(false)
	}

	// Eliminar cotización
	const handleDelete = async (id: string) => {
		if (!window.confirm("¿Seguro que deseas eliminar esta cotización?")) return
		try {
			await axios.delete(`http://localhost:8000/api/quotes/${id}`, {
				headers: { Authorization: `Bearer ${token}` },
			})
			window.location.reload()
		} catch (err) {
			alert("Error al eliminar la cotización")
		}
	}

	return (
		<section id="quotes">
			<div className="flex items-center justify-between mb-4">
				<div>
					<h2 className="text-2xl font-semibold tracking-tight">
						Cotizaciones
					</h2>
					<p className="text-sm text-muted-foreground mt-1">
						Administra cotizaciones y presupuestos
					</p>
				</div>
				<Button>
					<Plus className="h-4 w-4 mr-2" />
					Nueva Cotización
				</Button>
			</div>

			<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{quotesModules.map((module) => (
					<Card
						key={module.name}
						className="group hover:shadow-md transition-all cursor-pointer"
					>
						<CardContent className="p-6">
							<div className="flex items-start justify-between">
								<div className="flex items-center gap-3">
									<div
										className={`flex h-10 w-10 items-center justify-center rounded-lg ${
											module.status === "warning"
												? "bg-warning/10 text-warning"
												: module.status === "success"
												? "bg-success/10 text-success"
												: module.status === "destructive"
												? "bg-destructive/10 text-destructive"
												: "bg-muted text-muted-foreground"
										}`}
									>
										<module.icon className="h-5 w-5" />
									</div>
									<div>
										<h3 className="font-medium text-sm leading-tight">
											{module.name}
										</h3>
										{module.count !== null && (
											<p className="text-2xl font-bold mt-1">
												{module.count}
											</p>
										)}
									</div>
								</div>
								<ArrowRight className="h-4 w-4 text-muted-foreground opacity-0 group-hover:opacity-100 transition-opacity" />
							</div>
						</CardContent>
					</Card>
				))}
			</div>

			{/* Formulario de creación */}
			<form
				onSubmit={handleSubmit}
				className="space-y-4 max-w-lg mx-auto mt-8 bg-white p-6 rounded shadow"
			>
				<input
					name="cliente"
					value={form.cliente}
					onChange={handleChange}
					placeholder="Cliente"
				/>
				<input
					name="fecha"
					type="date"
					value={form.fecha}
					onChange={handleChange}
					placeholder="Fecha"
				/>
				<input
					name="monto"
					value={form.monto}
					onChange={handleChange}
					placeholder="Monto"
				/>
				<input
					name="estado"
					value={form.estado}
					onChange={handleChange}
					placeholder="Estado"
				/>
				<input
					name="validez"
					value={form.validez}
					onChange={handleChange}
					placeholder="Validez"
				/>
				<button type="submit" disabled={loading}>
					Guardar Cotización
				</button>
				{error && (
					<div className="text-red-500">
						{error}
					</div>
				)}
			</form>

			<div className="mt-8">
				<h3 className="text-lg font-semibold mb-4">Mis Cotizaciones</h3>
				<div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
					{quotes.map((quote) => (
						<Card key={quote.id} className="hover:shadow-md transition-shadow">
							<CardContent className="p-4">
								<h4 className="font-medium text-md">{quote.cliente}</h4>
								<p className="text-sm text-muted-foreground">
									{new Date(quote.fecha).toLocaleDateString("es-ES")}
								</p>
								<p className="text-lg font-bold mt-2">
									{quote.monto} €
								</p>
								<div className="flex gap-2 mt-4">
									<Button
										onClick={() => handleEdit(quote.id, { ...quote, estado: "Aprobada" })}
										className="flex-1"
									>
										Aprobar
									</Button>
									<Button
										onClick={() => handleDelete(quote.id)}
										variant="destructive"
										className="flex-1"
									>
										Eliminar
									</Button>
								</div>
							</CardContent>
						</Card>
					))}
				</div>
			</div>

			{/* Formulario de edición */}
			{editId && (
				<form onSubmit={handleEditSubmit} className="space-y-2 p-4 border rounded mb-4">
					<input name="cliente" value={editForm.cliente} onChange={handleEditChange} placeholder="Cliente" />
					<input name="fecha" type="date" value={editForm.fecha} onChange={handleEditChange} placeholder="Fecha" />
					<input name="monto" value={editForm.monto} onChange={handleEditChange} placeholder="Monto" />
					<input name="estado" value={editForm.estado} onChange={handleEditChange} placeholder="Estado" />
					<input name="validez" value={editForm.validez} onChange={handleEditChange} placeholder="Validez" />
					<button type="submit" disabled={loading}>Guardar Cambios</button>
					<button type="button" onClick={() => setEditId(null)}>Cancelar</button>
					{error && <div className="text-red-500">{error}</div>}
				</form>
			)}
		</section>
	)
}
