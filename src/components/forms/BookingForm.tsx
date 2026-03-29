import { useForm, useWatch } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { useClubs, useCourts } from '../../hooks/useQueries'
import { useAuth } from '../../contexts/auth-context'
import type { Booking } from '../../types'

const schema = z
  .object({
    clubId:     z.string().min(1, 'Seleccioná un club'),
    courtId:    z.string().min(1, 'Seleccioná una cancha'),
    fecha:      z.string().min(1, 'Seleccioná una fecha'),
    horaInicio: z.string().min(1, 'Ingresá hora de inicio'),
    horaFin:    z.string().min(1, 'Ingresá hora de fin'),
    notas:      z.string().optional(),
  })
  .refine((d) => d.horaFin > d.horaInicio, {
    message: 'La hora de fin debe ser posterior al inicio',
    path: ['horaFin'],
  })

type FormData = z.infer<typeof schema>

interface Props {
  fixedClubId?: string
  onSuccess: (booking: Booking) => void
  onCancel: () => void
}

export default function BookingForm({ fixedClubId, onSuccess, onCancel }: Props) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: clubs = [], isLoading: loadingClubs } = useClubs()

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
  } = useForm<FormData>({
    resolver: zodResolver(schema),
    defaultValues: { clubId: fixedClubId ?? '' },
  })

  const selectedClubId = useWatch({ control, name: 'clubId' })
  const { data: courts = [], isLoading: loadingCourts } = useCourts(
    selectedClubId || undefined
  )
  const activeCourts = courts.filter((c) => c.estado === 'activa')

  const mutation = useMutation({
    mutationFn: (data: FormData) =>
      api
        .post<Booking>('/bookings', {
          userId:      user!.id,
          courtId:     data.courtId,
          fecha:       data.fecha,
          horaInicio:  data.horaInicio,
          horaFin:     data.horaFin,
          notas:       data.notas || undefined,
          metodoReserva: 'web',
        })
        .then((r) => r.data),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      onSuccess(booking)
    },
  })

  const today = new Date().toISOString().split('T')[0]

  return (
    <form onSubmit={handleSubmit((data) => mutation.mutate(data))} className="flex flex-col gap-4">
      {/* Club */}
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

      {/* Court */}
      <div className="form-control">
        <label className="label"><span className="label-text">Cancha <span className="text-error">*</span></span></label>
        {loadingCourts ? (
          <div className="skeleton h-12 w-full rounded-lg" />
        ) : (
          <select {...register('courtId')} className="select select-bordered w-full" disabled={!selectedClubId}>
            <option value="">{selectedClubId ? 'Seleccioná una cancha' : 'Primero seleccioná un club'}</option>
            {activeCourts.map((c) => (
              <option key={c.id} value={c.id}>{c.nombre}</option>
            ))}
          </select>
        )}
        {errors.courtId && <span className="text-error text-xs mt-1">{errors.courtId.message}</span>}
      </div>

      {/* Date */}
      <div className="form-control">
        <label className="label"><span className="label-text">Fecha <span className="text-error">*</span></span></label>
        <input
          {...register('fecha')}
          type="date"
          min={today}
          className="input input-bordered w-full"
        />
        {errors.fecha && <span className="text-error text-xs mt-1">{errors.fecha.message}</span>}
      </div>

      {/* Time range */}
      <div className="grid grid-cols-2 gap-3">
        <div className="form-control">
          <label className="label"><span className="label-text">Hora inicio <span className="text-error">*</span></span></label>
          <input {...register('horaInicio')} type="time" className="input input-bordered w-full" />
          {errors.horaInicio && <span className="text-error text-xs mt-1">{errors.horaInicio.message}</span>}
        </div>
        <div className="form-control">
          <label className="label"><span className="label-text">Hora fin <span className="text-error">*</span></span></label>
          <input {...register('horaFin')} type="time" className="input input-bordered w-full" />
          {errors.horaFin && <span className="text-error text-xs mt-1">{errors.horaFin.message}</span>}
        </div>
      </div>

      {/* Notes */}
      <div className="form-control">
        <label className="label"><span className="label-text">Notas</span></label>
        <textarea {...register('notas')} className="textarea textarea-bordered w-full" rows={2} placeholder="Opcional" />
      </div>

      {mutation.isError && (
        <div className="alert alert-error text-sm">
          <span>
            {(mutation.error as any)?.response?.data?.message ?? 'Error al crear la reserva. Verificá los datos.'}
          </span>
        </div>
      )}

      <div className="modal-action mt-2">
        <button type="button" className="btn" onClick={onCancel}>Cancelar</button>
        <button type="submit" className="btn btn-primary" disabled={mutation.isPending}>
          {mutation.isPending ? <span className="loading loading-spinner loading-sm" /> : 'Confirmar reserva'}
        </button>
      </div>
    </form>
  )
}
