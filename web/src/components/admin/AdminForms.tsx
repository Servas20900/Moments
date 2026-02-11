import { useEffect, useState } from 'react'
import Button from '../Button'
import { InputField, TextareaField, CheckboxField } from '../FormField'
import ImageUpload from '../ImageUpload'
import ListItemInput from './ListItemInput'
import { createImageRecord, type CreateManualReservationData } from '../../api/api'
import type { CalendarSlotView, Package, Vehicle, SystemImage, HeroSlide } from '../../data/content'

export function AdminEventForm(
  { ev, onCancel, onSave, uploadImage }: { ev: CalendarSlotView; onCancel: () => void; onSave: (e: CalendarSlotView) => void; uploadImage: (file: File) => Promise<string> }
) {
  const [state, setState] = useState<CalendarSlotView>({
    ...ev,
    title: ev.title || '',
    date: ev.date || '',
    status: ev.status || 'evento',
    detail: ev.detail || '',
    tag: ev.tag || '',
    imageUrl: ev.imageUrl || '',
    id: ev.id || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setState(ev)
    setErrors({})
  }, [ev.id, ev])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value } = e.target
    setState((s: CalendarSlotView) => ({ ...s, [name]: value } as CalendarSlotView))
    if (errors[name]) setErrors((prev) => ({ ...prev, [name]: '' }))
  }

  const handleImageChange = (url: string) => {
    setState((s: CalendarSlotView) => ({ ...s, imageUrl: url }))
    if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!state.title.trim()) newErrors.title = 'El título es requerido'
    if (!state.date.trim()) newErrors.date = 'La fecha es requerida'
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    onSave(state)
  }

  return (
    <form className="grid gap-5 p-2" onSubmit={handleSubmit}>
      <InputField
        label="Título"
        required
        name="title"
        value={state.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Ej: Evento especial"
      />
      <InputField
        label="Fecha"
        required
        type="date"
        name="date"
        value={state.date}
        onChange={handleChange}
        error={errors.date}
      />
      <InputField
        label="Tag"
        name="tag"
        value={state.tag ?? ''}
        onChange={handleChange}
        placeholder="Ej: especial, promocion"
      />
      <TextareaField
        label="Detalle"
        name="detail"
        value={state.detail ?? ''}
        onChange={handleChange}
        placeholder="Descripcion del evento"
      />
      <ImageUpload
        label="Cargar imagen"
        value={state.imageUrl}
        onChange={handleImageChange}
        onUpload={uploadImage}
        error={errors.imageUrl}
      />
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <Button variant="primary" type="submit" className="flex-1">
          Guardar
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export function AdminPackageForm({ pkg, categories = [], vehiclesList = [], onCancel, onSave, uploadImage }: { pkg: Package; categories?: string[]; vehiclesList?: Vehicle[]; onCancel: () => void; onSave: (p: Package) => void; uploadImage: (file: File) => Promise<string> }) {
  const [name, setName] = useState(pkg.name || '')
  const [category, setCategory] = useState(pkg.category || '')
  const [description, setDescription] = useState(pkg.description || '')
  const [price, setPrice] = useState(pkg.price?.toString() || '')
  const [maxPeople, setMaxPeople] = useState(pkg.maxPeople?.toString() || '')
  const [imageUrl, setImageUrl] = useState(pkg.imageUrl || '')
  const [includes, setIncludes] = useState<string[]>(pkg.includes || [])
  const [selectedVehicleIds, setSelectedVehicleIds] = useState<string[]>(pkg.vehicleIds || pkg.vehicles?.map((v) => v.id) || [])
  const [errors, setErrors] = useState<Record<string, string>>({})

  useEffect(() => {
    setName(pkg.name || '')
    setCategory(pkg.category || '')
    setDescription(pkg.description || '')
    setPrice(pkg.price?.toString() || '')
    setMaxPeople(pkg.maxPeople?.toString() || '')
    setImageUrl(pkg.imageUrl || '')
    setIncludes(pkg.includes || [])
    setSelectedVehicleIds(pkg.vehicleIds || pkg.vehicles?.map((v) => v.id) || [])
    setErrors({})
  }, [pkg.id])

  const allCategories = Array.from(new Set([...categories, category].filter(Boolean)))

  const toggleVehicle = (id: string) => {
    setSelectedVehicleIds((prev) => prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id])
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!name.trim()) newErrors.name = 'El nombre es requerido'
    if (!category.trim()) newErrors.category = 'La categoría es requerida'
    const priceNum = Number(price)
    if (!price || isNaN(priceNum) || priceNum <= 0) newErrors.price = 'El precio debe ser mayor a 0'
    const maxPeopleNum = Number(maxPeople)
    if (!maxPeople || isNaN(maxPeopleNum) || maxPeopleNum < 1) newErrors.maxPeople = 'Capacidad minima 1'
    // Imagen es opcional
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    onSave({
      id: pkg.id,
      name: name.trim(),
      category: category.trim(),
      description: description.trim(),
      price: Number(price),
      maxPeople: Number(maxPeople),
      imageUrl,
      includes,
      vehicle: pkg.vehicle || '',
      vehicleIds: selectedVehicleIds,
      vehicles: pkg.vehicles || [],
    })
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <InputField
        label="Nombre"
        required
        name="name"
        value={name}
        onChange={(e) => {
          setName(e.target.value)
          if (errors.name) setErrors((prev) => ({ ...prev, name: '' }))
        }}
        error={errors.name}
        placeholder="Ej: Tour privado de 8 horas"
      />
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="flex flex-col gap-1.5 text-sm text-white">
          <span>Categoria <span className="text-red-400">*</span></span>
          <select
            name="category"
            value={category}
            onChange={(e) => {
              setCategory(e.target.value)
              if (errors.category) setErrors((prev) => ({ ...prev, category: '' }))
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
            required
          >
            <option value="">Selecciona una categoria</option>
            {allCategories.map((c) => (
              <option key={c} value={c}>
                {c}
              </option>
            ))}
          </select>
          {errors.category && <span className="text-xs text-red-400">{errors.category}</span>}
        </label>
        <InputField
          label="Precio"
          required
          type="text"
          inputMode="decimal"
          name="price"
          value={price}
          onChange={(e) => {
            const val = e.target.value
            if (/^\d*\.?\d{0,2}$/.test(val) || val === '') {
              setPrice(val)
              if (errors.price) setErrors((prev) => ({ ...prev, price: '' }))
            }
          }}
          error={errors.price}
          placeholder="0.00"
        />
        <InputField
          label="Capacidad (personas)"
          required
          type="text"
          inputMode="numeric"
          name="maxPeople"
          value={maxPeople}
          onChange={(e) => {
            const val = e.target.value
            if (/^\d*$/.test(val)) {
              setMaxPeople(val)
              if (errors.maxPeople) setErrors((prev) => ({ ...prev, maxPeople: '' }))
            }
          }}
          error={errors.maxPeople}
        />
      </div>
      <ListItemInput
        label="Incluye"
        required
        items={includes}
        onChange={setIncludes}
        placeholder="Ej: Chofer profesional"
        description="Agrega los servicios y comodidades incluidas en este paquete"
      />
      <div className="space-y-2">
        <p className="text-sm font-semibold text-white">Vehiculos asignados</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-h-56 overflow-y-auto pr-1">
          {vehiclesList.map((v) => (
            <label key={v.id} className="flex items-start gap-3 rounded-lg border border-white/10 bg-white/5 p-3 cursor-pointer hover:bg-white/10">
              <input
                type="checkbox"
                checked={selectedVehicleIds.includes(v.id)}
                onChange={() => toggleVehicle(v.id)}
                className="mt-1 w-4 h-4 rounded border-white/20 bg-white/5 text-amber-300 focus:ring-amber-300/60"
              />
              <div className="space-y-1">
                <p className="text-sm text-white font-semibold">{v.name}</p>
                <p className="text-xs text-gray-300">{v.seats} asientos</p>
                <p className="text-xs text-gray-400">{v.category}</p>
              </div>
            </label>
          ))}
          {vehiclesList.length === 0 && <p className="text-sm text-gray-400">No hay vehiculos cargados.</p>}
        </div>
      </div>
      <TextareaField
        label="Descripcion"
        name="description"
        value={description}
        onChange={(e) => setDescription(e.target.value)}
        placeholder="Descripcion detallada del paquete"
      />
      <ImageUpload
        label="Cargar imagen del paquete"
        value={imageUrl}
        onChange={(url) => {
          setImageUrl(url)
          if (errors.imageUrl) setErrors((prev) => ({ ...prev, imageUrl: '' }))
        }}
        onUpload={uploadImage}
        error={errors.imageUrl}
      />
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <Button variant="primary" type="submit" className="flex-1">
          Guardar
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export function AdminVehicleForm({ vehicle, categories = [], onCancel, onSave, uploadImage }: { vehicle: Vehicle; categories?: string[]; onCancel: () => void; onSave: (v: Vehicle) => void; uploadImage: (file: File) => Promise<string> }) {
  const [state, setState] = useState<Vehicle>({
    ...vehicle,
    name: vehicle.name || '',
    category: vehicle.category || '',
    seats: vehicle.seats ?? 1,
    rate: vehicle.rate || '',
    features: vehicle.features || [],
    imageUrl: vehicle.imageUrl || '',
    id: vehicle.id || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target

    if (type === 'number' && name === 'seats') {
      if (/^\d*$/.test(value)) {
        setState((s) => ({ ...s, seats: value } as any))
      }
    } else {
      setState((s) => ({ ...s, [name]: value } as any))
    }
    if (errors[name]) setErrors((e) => ({ ...e, [name]: '' }))
  }

  const handleImageChange = (url: string) => {
    setState(s => ({ ...s, imageUrl: url }))
    if (errors.imageUrl) setErrors(e => ({ ...e, imageUrl: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!state.name.trim()) newErrors.name = 'El nombre es requerido'
    if (!state.category.trim()) newErrors.category = 'La categoria es requerida'
    const seatsValue = typeof state.seats === 'string' ? Number(state.seats) : state.seats
    if (!Number.isFinite(seatsValue) || seatsValue < 1) newErrors.seats = 'Minimo 1 asiento'
    // Imagen es opcional
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const seatsValue = typeof state.seats === 'string' ? Number(state.seats) : state.seats
    onSave({ ...state, seats: seatsValue })
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <InputField
        label="Nombre"
        required
        name="name"
        value={state.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Ej: Camioneta Escalade"
      />
      <div className="admin-form__group-row">
        <InputField
          label="Categoria"
          required
          name="category"
          value={state.category}
          onChange={handleChange}
          error={errors.category}
          placeholder="Nueva o existente"
          list="veh-cats"
        />
        <InputField
          label="Asientos"
          required
          type="number"
          name="seats"
          value={state.seats}
          onChange={handleChange}
          error={errors.seats}
          min="1"
        />
      </div>
      <datalist id="veh-cats">
        {categories.map((c) => <option key={c} value={c} />)}
      </datalist>
      <ListItemInput
        label="Características"
        required
        items={state.features}
        onChange={(features) => setState(s => ({ ...s, features }))}
        placeholder="Ej: Aire acondicionado"
        description="Agrega todas las características y comodidades del vehículo"
      />
      <ImageUpload
        label="Cargar imagen del vehiculo"
        required
        value={state.imageUrl}
        onChange={handleImageChange}
        onUpload={uploadImage}
        error={errors.imageUrl}
      />
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <Button variant="primary" type="submit" className="flex-1">
          Guardar
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export function CreateCategoryForm({ onCreate, onCancel }: { onCreate: (name: string) => void; onCancel: () => void }) {
  const [name, setName] = useState('')
  const [error, setError] = useState('')

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setName(e.target.value)
    if (error) setError('')
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    if (!name.trim()) {
      setError('El nombre de la categoria es requerido')
      return
    }
    onCreate(name.trim())
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <InputField
        label="Nombre de categoria"
        required
        value={name}
        onChange={handleChange}
        error={error}
        placeholder="Ej: Tours Privados"
      />
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <Button variant="primary" type="submit" className="flex-1">
          Crear
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export function AdminImageForm({ img, onCancel, onSave, uploadImage }: { img: SystemImage; onCancel: () => void; onSave: (img: SystemImage) => void; uploadImage: (file: File) => Promise<string> }) {
  const [state, setState] = useState<SystemImage>({
    ...img,
    name: img.name || '',
    description: img.description || '',
    url: img.url || '',
    altText: img.altText || '',
    order: img.order ?? 0,
    isActive: img.isActive ?? true,
    id: img.id || '',
    category: img.category || 'GALERIA',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setState(s => ({
      ...s,
      [name]: type === 'checkbox' ? (e.target as HTMLInputElement).checked : name === 'order' ? value : value
    }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleImageChange = (url: string) => {
    setState(s => ({ ...s, url }))
    if (errors.url) setErrors(e => ({ ...e, url: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!state.name.trim()) newErrors.name = 'El nombre es requerido'
    // Imagen es opcional en la galería
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const orderValue = typeof state.order === 'string' ? Number(state.order) : state.order
    const normalizedOrder = Number.isFinite(orderValue) ? Number(orderValue) : 0
    const imgToSave = { ...state, order: normalizedOrder, categoria: 'GALERIA' }
    if (imgToSave.url) {
      await createImageRecord({ categoria: 'GALERIA', url: imgToSave.url, altText: imgToSave.name })
    }
    onSave(imgToSave)
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <InputField
        label="Nombre"
        required
        name="name"
        value={state.name}
        onChange={handleChange}
        error={errors.name}
        placeholder="Ej: Galeria inicio"
      />
      <TextareaField
        label="Descripcion"
        name="description"
        value={state.description ?? ''}
        onChange={handleChange}
        placeholder="Descripcion opcional"
      />
      <ImageUpload
        label="Cargar imagen"
        required
        value={state.url}
        onChange={handleImageChange}
        onUpload={uploadImage}
        error={errors.url}
      />
      <InputField
        label="Texto alternativo"
        name="altText"
        value={state.altText ?? ''}
        onChange={handleChange}
        placeholder="Descripcion para accesibilidad"
      />
      <InputField
        label="Orden"
        type="number"
        name="order"
        value={state.order}
        onChange={handleChange}
        min="0"
      />
      <CheckboxField
        label="Mostrar en galeria"
        name="isActive"
        checked={state.isActive}
        onChange={handleChange}
      />
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <Button variant="primary" type="submit" className="flex-1">
          Guardar
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

export function AdminHeroSlideForm({ slide, onCancel, onSave, uploadImage }: { slide: HeroSlide; onCancel: () => void; onSave: (slide: HeroSlide) => void; uploadImage: (file: File) => Promise<string> }) {
  const [state, setState] = useState<HeroSlide>({
    ...slide,
    title: slide.title || '',
    subtitle: slide.subtitle || '',
    description: slide.description || '',
    imageUrl: slide.imageUrl || '',
    order: Number(slide.order ?? 0),
    isActive: slide.isActive ?? true,
    id: slide.id || '',
  })
  const [errors, setErrors] = useState<Record<string, string>>({})

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value, type } = e.target
    setState(s => ({
      ...s,
      [name]: type === 'checkbox'
        ? (e.target as HTMLInputElement).checked
        : name === 'order'
          ? Number(value)
          : value
    }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleImageChange = (url: string) => {
    setState(s => ({ ...s, imageUrl: url }))
    if (errors.imageUrl) setErrors(e => ({ ...e, imageUrl: '' }))
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!state.title.trim()) newErrors.title = 'El titulo es requerido'
    if (!(state.subtitle ?? '').trim()) newErrors.subtitle = 'El subtitulo es requerido'
    if (!(state.description ?? '').trim()) newErrors.description = 'La descripcion es requerida'
    if (!state.imageUrl) newErrors.imageUrl = 'La imagen es requerida'
    return newErrors
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }
    const orderValue = typeof state.order === 'string' ? Number(state.order) : state.order
    const normalizedOrder = Number.isFinite(orderValue) ? Number(orderValue) : 0
    onSave({ ...state, order: normalizedOrder })
  }

  return (
    <form className="admin-form" onSubmit={handleSubmit}>
      <InputField
        label="Titulo"
        required
        name="title"
        value={state.title}
        onChange={handleChange}
        error={errors.title}
        placeholder="Ej: Descubre Momentos"
      />
      <InputField
        label="Subtitulo"
        required
        name="subtitle"
        value={state.subtitle}
        onChange={handleChange}
        error={errors.subtitle}
        placeholder="Ej: Experiencias inolvidables"
      />
      <TextareaField
        label="Descripcion"
        required
        name="description"
        value={state.description}
        onChange={handleChange}
        error={errors.description}
        placeholder="Descripcion del slide"
      />
      <ImageUpload
        label="Cargar imagen del slide"
        required
        value={state.imageUrl}
        onChange={handleImageChange}
        onUpload={uploadImage}
        error={errors.imageUrl}
      />
      <div className="admin-form__group-row">
        <InputField
          label="Orden"
          type="number"
          name="order"
          value={state.order}
          onChange={handleChange}
          min="1"
        />
        <div style={{ display: 'flex', alignItems: 'flex-end' }}>
          <CheckboxField
            label="Slide activo"
            name="isActive"
            checked={state.isActive}
            onChange={handleChange}
          />
        </div>
      </div>
      <div className="admin-form__actions">
        <Button variant="primary" type="submit" className="admin-form__actions-primary">
          Guardar
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="admin-form__actions-secondary">
          Cancelar
        </Button>
      </div>
    </form>
  )
}

interface AdminManualReservationFormProps {
  packages: Package[]
  vehicles: Vehicle[]
  onCancel: () => void
  onSave: (data: CreateManualReservationData) => Promise<void>
}

export function AdminManualReservationForm({ packages, vehicles, onCancel, onSave }: AdminManualReservationFormProps) {
  const [state, setState] = useState<CreateManualReservationData>({
    nombre: '',
    email: '',
    telefono: '',
    identificacion: '',
    notasInternas: '',
    paqueteId: '',
    vehiculoId: '',
    conductorId: '',
    tipoEvento: '',
    fechaEvento: '',
    horaInicio: '',
    horaFin: '',
    origen: '',
    destino: '',
    numeroPersonas: 1,
    tipoPago: 'SINPE',
    origenReserva: 'MANUAL',
    anticipo: 0,
    estadoInicial: 'PAGO_PENDIENTE',
    extras: [],
    comentario: '',
  })
  
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [submitting, setSubmitting] = useState(false)
  const [selectedPackage, setSelectedPackage] = useState<Package | null>(null)
  const [precioTotal, setPrecioTotal] = useState(0)
  const [adelantoCalculado, setAdelantoCalculado] = useState(0)
  const [hasConflict, setHasConflict] = useState(false)
  const [checkingConflict, setCheckingConflict] = useState(false)

  // Calcular precio cuando cambia el paquete
  useEffect(() => {
    if (state.paqueteId) {
      const pkg = packages.find(p => p.id === state.paqueteId)
      if (pkg) {
        setSelectedPackage(pkg)
        const total = pkg.price
        setPrecioTotal(total)
        // 50% adelanto por defecto
        setAdelantoCalculado(total * 0.5)
      }
    } else {
      setSelectedPackage(null)
      setPrecioTotal(0)
      setAdelantoCalculado(0)
    }
  }, [state.paqueteId, packages])

  // Detectar conflictos cuando cambia vehículo o fecha
  useEffect(() => {
    const checkConflict = async () => {
      if (!state.vehiculoId || !state.fechaEvento) {
        setHasConflict(false)
        return
      }

      setCheckingConflict(true)
      try {
        const { checkVehicleAvailability } = await import('../../api/api')
        const availability = await checkVehicleAvailability(state.vehiculoId, state.fechaEvento)
        setHasConflict(!availability.available)
      } catch (error) {
        console.error('Error verificando conflictos:', error)
        setHasConflict(false)
      } finally {
        setCheckingConflict(false)
      }
    }

    checkConflict()
  }, [state.vehiculoId, state.fechaEvento])

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name, value, type } = e.target
    setState(s => ({
      ...s,
      [name]: type === 'number' ? Number(value) : value
    }))
    if (errors[name]) setErrors(e => ({ ...e, [name]: '' }))
  }

  const handleCheckboxChange = (checked: boolean) => {
    if (checked) {
      setState(s => ({
        ...s,
        estadoInicial: 'CONFIRMADA',
        anticipo: precioTotal
      }))
    } else {
      setState(s => ({
        ...s,
        estadoInicial: 'PAGO_PENDIENTE',
        anticipo: 0
      }))
    }
  }

  const validate = () => {
    const newErrors: Record<string, string> = {}
    if (!state.nombre.trim()) newErrors.nombre = 'El nombre es requerido'
    if (!state.email.trim()) newErrors.email = 'El email es requerido'
    if (!state.telefono.trim()) newErrors.telefono = 'El teléfono es requerido'
    if (!state.paqueteId) newErrors.paqueteId = 'Debe seleccionar un paquete'
    if (!state.vehiculoId) newErrors.vehiculoId = 'Debe seleccionar un vehículo'
    if (!state.tipoEvento.trim()) newErrors.tipoEvento = 'El tipo de evento es requerido'
    if (!state.fechaEvento) newErrors.fechaEvento = 'La fecha es requerida'
    if (!state.horaInicio) newErrors.horaInicio = 'La hora de inicio es requerida'
    if (!state.horaFin) newErrors.horaFin = 'La hora de fin es requerida'
    if (!state.origen.trim()) newErrors.origen = 'El origen es requerido'
    if (!state.destino.trim()) newErrors.destino = 'El destino es requerido'
    if (state.numeroPersonas < 1) newErrors.numeroPersonas = 'Mínimo 1 persona'
    
    return newErrors
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    const newErrors = validate()
    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors)
      return
    }

    setSubmitting(true)
    try {
      await onSave(state)
    } catch (error) {
      console.error('Error al guardar reserva:', error)
      alert(error instanceof Error ? error.message : 'Error al guardar reserva')
    } finally {
      setSubmitting(false)
    }
  }

  // Filtrar vehículos según paquete seleccionado
  const availableVehicles = selectedPackage && selectedPackage.vehicleIds && selectedPackage.vehicleIds.length > 0
    ? vehicles.filter(v => selectedPackage.vehicleIds!.includes(v.id))
    : vehicles

  return (
    <form className="grid gap-6 p-2 max-h-[80vh] overflow-y-auto" onSubmit={handleSubmit}>
      {/* A) DATOS DEL CLIENTE */}
      <div className="border border-white/10 rounded-xl p-4 bg-white/5">
        <h3 className="text-lg font-semibold text-amber-300 mb-4">A) Datos del Cliente</h3>
        <div className="grid gap-4">
          <InputField
            label="Nombre completo"
            required
            name="nombre"
            value={state.nombre}
            onChange={handleChange}
            error={errors.nombre}
            placeholder="Ej: Juan Pérez"
          />
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Email"
              required
              type="email"
              name="email"
              value={state.email}
              onChange={handleChange}
              error={errors.email}
              placeholder="cliente@ejemplo.com"
            />
            <InputField
              label="Teléfono"
              required
              name="telefono"
              value={state.telefono}
              onChange={handleChange}
              error={errors.telefono}
              placeholder="+506 XXXX-XXXX"
            />
          </div>
          <InputField
            label="Identificación (opcional)"
            name="identificacion"
            value={state.identificacion || ''}
            onChange={handleChange}
            placeholder="Cédula o pasaporte"
          />
          <TextareaField
            label="Notas internas (solo visible para admin)"
            name="notasInternas"
            value={state.notasInternas || ''}
            onChange={handleChange}
            placeholder="Notas privadas sobre el cliente o la reserva..."
            rows={2}
          />
        </div>
      </div>

      {/* B) DATOS DEL EVENTO */}
      <div className="border border-white/10 rounded-xl p-4 bg-white/5">
        <h3 className="text-lg font-semibold text-amber-300 mb-4">B) Datos del Evento</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-200 mb-2">
                Paquete <span className="text-red-400">*</span>
              </label>
              <select
                name="paqueteId"
                value={state.paqueteId}
                onChange={handleChange}
                className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
              >
                <option value="">Seleccionar paquete...</option>
                {packages.map(pkg => (
                  <option key={pkg.id} value={pkg.id}>{pkg.name} - ${pkg.price}</option>
                ))}
              </select>
              {errors.paqueteId && <p className="text-red-400 text-sm mt-1">{errors.paqueteId}</p>}
            </div>
            <InputField
              label="Tipo de evento"
              required
              name="tipoEvento"
              value={state.tipoEvento}
              onChange={handleChange}
              error={errors.tipoEvento}
              placeholder="Ej: Boda, Cumpleaños, Tour"
            />
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <InputField
              label="Fecha del evento"
              required
              type="date"
              name="fechaEvento"
              value={state.fechaEvento}
              onChange={handleChange}
              error={errors.fechaEvento}
            />
            <InputField
              label="Hora inicio"
              required
              type="time"
              name="horaInicio"
              value={state.horaInicio}
              onChange={handleChange}
              error={errors.horaInicio}
            />
            <InputField
              label="Hora fin"
              required
              type="time"
              name="horaFin"
              value={state.horaFin}
              onChange={handleChange}
              error={errors.horaFin}
            />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <InputField
              label="Origen"
              required
              name="origen"
              value={state.origen}
              onChange={handleChange}
              error={errors.origen}
              placeholder="Punto de recogida"
            />
            <InputField
              label="Destino"
              required
              name="destino"
              value={state.destino}
              onChange={handleChange}
              error={errors.destino}
              placeholder="Punto de llegada"
            />
          </div>

          <InputField
            label="Número de personas"
            required
            type="number"
            min="1"
            name="numeroPersonas"
            value={state.numeroPersonas}
            onChange={handleChange}
            error={errors.numeroPersonas}
          />
        </div>
      </div>

      {/* C) VEHÍCULO */}
      <div className="border border-white/10 rounded-xl p-4 bg-white/5">
        <h3 className="text-lg font-semibold text-amber-300 mb-4">C) Vehículo</h3>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            Vehículo <span className="text-red-400">*</span>
          </label>
          <select
            name="vehiculoId"
            value={state.vehiculoId}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
          >
            <option value="">Seleccionar vehículo...</option>
            {availableVehicles.map(veh => (
              <option key={veh.id} value={veh.id}>
                {veh.name} - {veh.category} ({veh.seats} asientos)
              </option>
            ))}
          </select>
          {errors.vehiculoId && <p className="text-red-400 text-sm mt-1">{errors.vehiculoId}</p>}
          
          {checkingConflict && state.vehiculoId && state.fechaEvento && (
            <div className="mt-3 p-3 rounded-lg bg-blue-500/20 border border-blue-500/50">
              <p className="text-blue-300 text-sm flex items-center gap-2">
                <span className="animate-pulse">🔍</span>
                <span>Verificando disponibilidad...</span>
              </p>
            </div>
          )}
          
          {!checkingConflict && hasConflict && (
            <div className="mt-3 p-3 rounded-lg bg-yellow-500/20 border border-yellow-500/50">
              <p className="text-yellow-300 text-sm flex items-center gap-2">
                <span>⚠️</span>
                <span><strong>ADVERTENCIA:</strong> Este vehículo ya está reservado o bloqueado en esa fecha. La reserva se creará de todas formas (pueden existir conflictos de horario).</span>
              </p>
            </div>
          )}
        </div>
      </div>

      {/* D) INFORMACIÓN FINANCIERA */}
      <div className="border border-white/10 rounded-xl p-4 bg-white/5">
        <h3 className="text-lg font-semibold text-amber-300 mb-4">D) Información Financiera</h3>
        <div className="grid gap-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Total (calculado)</p>
              <p className="text-2xl font-bold text-white">${precioTotal.toFixed(2)}</p>
            </div>
            <div className="p-3 bg-white/5 rounded-lg">
              <p className="text-xs text-gray-400 mb-1">Adelanto sugerido (50%)</p>
              <p className="text-2xl font-bold text-amber-300">${adelantoCalculado.toFixed(2)}</p>
            </div>
          </div>
          <p className="text-xs text-gray-400 italic">
            ℹ️ Los montos no son editables manualmente. Se calculan automáticamente según el paquete seleccionado.
          </p>
        </div>
      </div>

      {/* E) ORIGEN DE LA RESERVA */}
      <div className="border border-white/10 rounded-xl p-4 bg-white/5">
        <h3 className="text-lg font-semibold text-amber-300 mb-4">E) Origen de la Reserva</h3>
        <div>
          <label className="block text-sm font-medium text-gray-200 mb-2">
            ¿De dónde proviene esta reserva? <span className="text-red-400">*</span>
          </label>
          <select
            name="origenReserva"
            value={state.origenReserva}
            onChange={handleChange}
            className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
          >
            <option value="WEB">Web (formulario público)</option>
            <option value="WHATSAPP">WhatsApp</option>
            <option value="INSTAGRAM">Instagram</option>
            <option value="CORREO">Correo electrónico</option>
            <option value="MANUAL">Manual / Teléfono</option>
            <option value="CORPORATIVO">Corporativo</option>
          </select>
        </div>
      </div>

      {/* F) ESTADOS Y MÉTODOS DE PAGO */}
      <div className="border border-white/10 rounded-xl p-4 bg-white/5">
        <h3 className="text-lg font-semibold text-amber-300 mb-4">F) Métodos de Pago y Estados</h3>
        <div className="grid gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-200 mb-2">
              Tipo de pago
            </label>
            <select
              name="tipoPago"
              value={state.tipoPago}
              onChange={handleChange}
              className="w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white focus:border-amber-300/60 focus:outline-none"
            >
              <option value="TARJETA">Tarjeta</option>
              <option value="SINPE">SINPE Móvil</option>
              <option value="TRANSFERENCIA">Transferencia</option>
            </select>
          </div>

          <div className="p-4 bg-blue-500/10 border border-blue-500/30 rounded-lg">
            <label className="flex items-start gap-3 cursor-pointer">
              <input
                type="checkbox"
                checked={state.estadoInicial === 'CONFIRMADA'}
                onChange={(e) => handleCheckboxChange(e.target.checked)}
                className="w-5 h-5 rounded border-white/20 bg-white/10 mt-1"
              />
              <div className="flex-1">
                <p className="text-white font-semibold text-base">✓ Marcar como PAGO COMPLETO MANUAL</p>
                <p className="text-sm text-gray-300 mt-2">
                  Al activar esta opción:
                </p>
                <ul className="text-xs text-gray-400 mt-1 ml-4 space-y-1">
                  <li>• La reserva se creará con estado <span className="text-green-400 font-semibold">CONFIRMADA</span></li>
                  <li>• El anticipo será igual al total: <span className="text-amber-300 font-semibold">${precioTotal.toFixed(2)}</span></li>
                  <li>• El restante será: <span className="text-gray-300">$0.00</span></li>
                  <li>• Quedará registrado en el historial como "PAGO COMPLETO MANUAL"</li>
                </ul>
              </div>
            </label>
          </div>

          <TextareaField
            label="Comentario (opcional)"
            name="comentario"
            value={state.comentario || ''}
            onChange={handleChange}
            placeholder="Comentario inicial para el historial..."
            rows={2}
          />
        </div>
      </div>

      {/* BOTONES */}
      <div className="flex gap-3 pt-3 border-t border-white/10">
        <Button variant="primary" type="submit" className="flex-1" disabled={submitting}>
          {submitting ? 'Guardando...' : '✓ Crear Reserva'}
        </Button>
        <Button variant="ghost" type="button" onClick={onCancel} className="flex-1" disabled={submitting}>
          Cancelar
        </Button>
      </div>
    </form>
  )
}
