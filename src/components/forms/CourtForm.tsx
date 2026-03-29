import { useEffect, useState } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import api from '../../lib/api'
import type { Club, Court } from '../../types'

const schema = z.object({
  clubId:     z.string().min(1, 'Seleccioná un club'),
  nombre:     z.string().min(1, 'Requerido'),
  tipo:       z.enum(['blindex', 'cemento', 'sintetico', 'cesped']).optional(),
  iluminacion: z.boolean().optional(),
  techada:    z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  /** If provided, club is fixed (owner mode) */
  fixedClubId?: string
  onSuccess: (court: Court) => void
  onCancel: () => void
}

export default function CourtForm({ fixedClubId, onSuccess, onCancel }: Props) {
  const [clubs, setClubs] = useState<Club[]>([])
  const [loadingClubs, setLoadingClubs] = useState(!fixedClubId)

  const {
    register,
    handleSubmit,
    setError,
    setValue,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { clubId: fixedClubId ?? '' },
  })

  // Superadmin: load clubs list
  useEffect(() => {
    if (fixedClubId) return
    api.get<Club[]>('/clubs')
      .then((res) => setClubs(res.data))
      .finally(() => setLoadingClubs(false))
  }, [fixedClubId])

  // Keep fixedClubId in sync if provided
  useEffect(() => {
    if (fixedClubId) setValue('clubId', fixedClubId)
  }, [fixedClubId, setValue])

  async function onSubmit(data: FormData) {
    try {
      const res = await api.post<Court>('/courts', data)
      onSuccess(res.data)
    } catch {
      setError('root', { message: 'Error al crear la cancha. Verificá los datos.' })
    }
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Club selector — only for superadmin */}
      {!fixedClubId && (
        <div className="form-control">
          <label className="label"><span className="label-text">Club <span className="text-error">*</span></span></label>
          {loadingClubs ? (
            <div className="skeleton h-12 w-full rounded-lg" />
          ) : (
            <select {...register('clubId')} className="select select-bordered w-full">
              <option value="">Seleccioná un club</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          )}
          {errors.clubId && <span className="text-error text-xs mt-1">{errors.clubId.message}</span>}
        </div>
      )}

      {/* Nombre */}
      <div className="form-control">
        <label className="label"><span className="label-text">Nombre de la cancha <span className="text-error">*</span></span></label>
        <input {...register('nombre')} type="text" placeholder="Cancha 1" className="input input-bordered w-full" />
        {errors.nombre && <span className="text-error text-xs mt-1">{errors.nombre.message}</span>}
      </div>

      {/* Tipo */}
      <div className="form-control">
        <label className="label"><span className="label-text">Tipo de superficie</span></label>
        <select {...register('tipo')} className="select select-bordered w-full">
          <option value="">Sin especificar</option>
          <option value="blindex">Blindex</option>
          <option value="cemento">Cemento</option>
          <option value="sintetico">Sintético</option>
          <option value="cesped">Césped</option>
        </select>
      </div>

      {/* Checkboxes */}
      <div className="flex gap-6">
        <label className="flex items-center gap-2 cursor-pointer">
          <input {...register('iluminacion')} type="checkbox" className="checkbox checkbox-sm" />
          <span className="text-sm">Con iluminación</span>
        </label>
        <label className="flex items-center gap-2 cursor-pointer">
          <input {...register('techada')} type="checkbox" className="checkbox checkbox-sm" />
          <span className="text-sm">Techada</span>
        </label>
      </div>

      {errors.root && (
        <div className="alert alert-error text-sm"><span>{errors.root.message}</span></div>
      )}

      <div className="modal-action mt-2">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={isSubmitting}>
          {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Guardar cancha'}
        </button>
      </div>
    </form>
  )
}
