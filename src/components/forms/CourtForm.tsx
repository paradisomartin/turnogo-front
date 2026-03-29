import { useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { useClubs } from '../../hooks/useQueries'
import type { Court } from '../../types'

const schema = z.object({
  clubId:      z.string().min(1, 'Seleccioná un club'),
  tipo:        z.enum(['blindex', 'cemento', 'sintetico', 'cesped']).optional(),
  iluminacion: z.boolean().optional(),
  techada:     z.boolean().optional(),
})

type FormData = z.infer<typeof schema>

interface Props {
  fixedClubId?: string
  onSuccess: (court: Court) => void
  onCancel: () => void
}

export default function CourtForm({ fixedClubId, onSuccess, onCancel }: Props) {
  const queryClient = useQueryClient()
  const { data: clubs = [], isLoading: loadingClubs } = useClubs()

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post<Court>('/courts', data).then((r) => r.data),
    onSuccess: (court) => {
      queryClient.invalidateQueries({ queryKey: ['courts'] })
      onSuccess(court)
    },
  })

  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { clubId: fixedClubId ?? '' },
  })

  useEffect(() => {
    if (fixedClubId) setValue('clubId', fixedClubId)
  }, [fixedClubId, setValue])

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
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

      <p className="text-base-content/50 text-sm -mt-1">
        El nombre se asigna automáticamente (Cancha 1, Cancha 2, etc.)
      </p>

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

      {mutation.isError && (
        <div className="alert alert-error text-sm"><span>Error al crear la cancha. Verificá los datos.</span></div>
      )}

      <div className="modal-action mt-2">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? <span className="loading loading-spinner loading-sm" /> : 'Guardar cancha'}
        </button>
      </div>
    </form>
  )
}
