import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../lib/api'
import type { Club } from '../../types'

const schema = z.object({
  nombre:          z.string().min(1, 'Requerido'),
  direccion:       z.string().optional(),
  telefono:        z.string().optional(),
  horarioApertura: z.string().optional(),
  horarioCierre:   z.string().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  onSuccess: (club: Club) => void
  onCancel: () => void
}

export default function ClubForm({ onSuccess, onCancel }: Props) {
  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      const res = await api.post<Club>('/clubs', data)
      onSuccess(res.data)
    } catch {
      setError('root', { message: 'Error al crear el club. Verificá los datos.' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Nombre */}
      <div className="form-control">
        <label className="label"><span className="label-text">Nombre del club <span className="text-error">*</span></span></label>
        <input {...register('nombre')} type="text" placeholder="La Ola Padel" className="input input-bordered w-full" />
        {errors.nombre && <span className="text-error text-xs mt-1">{errors.nombre.message}</span>}
      </div>

      {/* Dirección */}
      <div className="form-control">
        <label className="label"><span className="label-text">Dirección</span></label>
        <input {...register('direccion')} type="text" placeholder="Av. Siempreviva 742" className="input input-bordered w-full" />
      </div>

      {/* Teléfono */}
      <div className="form-control">
        <label className="label"><span className="label-text">Teléfono</span></label>
        <input {...register('telefono')} type="tel" placeholder="+54 11 1234-5678" className="input input-bordered w-full" />
      </div>

      {/* Horarios */}
      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label"><span className="label-text">Apertura</span></label>
          <input {...register('horarioApertura')} type="time" className="input input-bordered w-full" />
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Cierre</span></label>
          <input {...register('horarioCierre')} type="time" className="input input-bordered w-full" />
        </div>
      </div>

      {errors.root && (
        <div className="alert alert-error text-sm"><span>{errors.root.message}</span></div>
      )}

      <div className="modal-action mt-2">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Guardar club'}
        </button>
      </div>
    </form>
  )
}
