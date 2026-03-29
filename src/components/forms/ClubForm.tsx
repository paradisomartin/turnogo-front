import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
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
  const queryClient = useQueryClient()

  const mutation = useMutation({
    mutationFn: (data: FormData) => api.post<Club>('/clubs', data).then((r) => r.data),
    onSuccess: (club) => {
      queryClient.invalidateQueries({ queryKey: ['clubs'] })
      onSuccess(club)
    },
  })

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
      <div className="form-control">
        <label className="label"><span className="label-text">Nombre del club <span className="text-error">*</span></span></label>
        <input {...register('nombre')} type="text" placeholder="La Ola Padel" className="input input-bordered w-full" />
        {errors.nombre && <span className="text-error text-xs mt-1">{errors.nombre.message}</span>}
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text">Dirección</span></label>
        <input {...register('direccion')} type="text" placeholder="Av. Siempreviva 742" className="input input-bordered w-full" />
      </div>

      <div className="form-control">
        <label className="label"><span className="label-text">Teléfono</span></label>
        <input {...register('telefono')} type="tel" placeholder="+54 11 1234-5678" className="input input-bordered w-full" />
      </div>

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

      {mutation.isError && (
        <div className="alert alert-error text-sm"><span>Error al crear el club. Verificá los datos.</span></div>
      )}

      <div className="modal-action mt-2">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? <span className="loading loading-spinner loading-sm" /> : 'Guardar club'}
        </button>
      </div>
    </form>
  )
}
