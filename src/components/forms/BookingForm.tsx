import { useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import api from '../../lib/api'
import { useClubs, useAvailableSlots } from '../../hooks/useQueries'
import { useAuth } from '../../contexts/auth-context'
import type { Booking } from '../../types'

interface Props {
  fixedClubId?: string
  onSuccess: (booking: Booking) => void
  onCancel: () => void
}

export default function BookingForm({ fixedClubId, onSuccess, onCancel }: Props) {
  const { user } = useAuth()
  const queryClient = useQueryClient()

  const { data: clubs = [], isLoading: loadingClubs } = useClubs()

  const [clubId, setClubId]         = useState(fixedClubId ?? '')
  const [fecha, setFecha]           = useState('')
  const [selectedSlot, setSlot]     = useState<string | null>(null) // horaInicio
  const [clubError, setClubError]   = useState('')
  const [fechaError, setFechaError] = useState('')
  const [slotError, setSlotError]   = useState('')

  const today = new Date().toISOString().split('T')[0]

  const { data: slots = [], isLoading: loadingSlots } = useAvailableSlots(
    clubId || undefined,
    fecha || undefined,
  )

  const mutation = useMutation({
    mutationFn: () =>
      api
        .post<Booking>('/bookings', {
          userId:     user!.id,
          clubId:     clubId,
          horaInicio: selectedSlot,
          fecha,
          metodoReserva: 'web',
        })
        .then((r) => r.data),
    onSuccess: (booking) => {
      queryClient.invalidateQueries({ queryKey: ['bookings'] })
      queryClient.invalidateQueries({ queryKey: ['available-slots'] })
      onSuccess(booking)
    },
  })

  function validate() {
    let ok = true
    if (!clubId)       { setClubError('Seleccioná un club'); ok = false }
    else               setClubError('')
    if (!fecha)        { setFechaError('Seleccioná una fecha'); ok = false }
    else               setFechaError('')
    if (!selectedSlot) { setSlotError('Seleccioná un horario'); ok = false }
    else               setSlotError('')
    return ok
  }

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault()
    if (!validate()) return
    mutation.mutate()
  }

  const selectedSlotData = slots.find((s) => s.horaInicio === selectedSlot)

  return (
    <form onSubmit={handleSubmit} className="flex flex-col gap-5">
      {/* Club */}
      {!fixedClubId && (
        <div className="form-control">
          <label className="label"><span className="label-text">Club <span className="text-error">*</span></span></label>
          {loadingClubs ? (
            <div className="skeleton h-12 w-full rounded-lg" />
          ) : (
            <select
              value={clubId}
              onChange={(e) => { setClubId(e.target.value); setSlot(null) }}
              className="select select-bordered w-full"
            >
              <option value="">Seleccioná un club</option>
              {clubs.map((c) => (
                <option key={c.id} value={c.id}>{c.nombre}</option>
              ))}
            </select>
          )}
          {clubError && <span className="text-error text-xs mt-1">{clubError}</span>}
        </div>
      )}

      {/* Date */}
      <div className="form-control">
        <label className="label"><span className="label-text">Fecha <span className="text-error">*</span></span></label>
        <input
          type="date"
          min={today}
          value={fecha}
          onChange={(e) => { setFecha(e.target.value); setSlot(null) }}
          className="input input-bordered w-full"
        />
        {fechaError && <span className="text-error text-xs mt-1">{fechaError}</span>}
      </div>

      {/* Slot picker */}
      <div className="form-control">
        <label className="label"><span className="label-text">Horario <span className="text-error">*</span></span></label>

        {!clubId || !fecha ? (
          <p className="text-base-content/40 text-sm">Seleccioná club y fecha para ver los turnos disponibles.</p>
        ) : loadingSlots ? (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {Array.from({ length: 10 }).map((_, i) => (
              <div key={i} className="skeleton h-12 rounded-lg" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-3 sm:grid-cols-5 gap-2">
            {slots.map((s) => {
              const isSelected = selectedSlot === s.horaInicio
              return (
                <button
                  key={s.horaInicio}
                  type="button"
                  disabled={!s.disponible}
                  onClick={() => setSlot(s.horaInicio)}
                  className={[
                    'btn btn-sm h-auto py-2 flex-col gap-0',
                    isSelected
                      ? 'btn-primary'
                      : s.disponible
                      ? 'btn-outline'
                      : 'btn-ghost opacity-40 cursor-not-allowed line-through',
                  ].join(' ')}
                >
                  <span className="text-xs font-semibold">{s.horaInicio}</span>
                  <span className="text-[10px] font-normal opacity-70">{s.horaFin}</span>
                </button>
              )
            })}
          </div>
        )}

        {selectedSlotData && (
          <p className="text-xs text-base-content/50 mt-2">
            Turno: {selectedSlotData.horaInicio} – {selectedSlotData.horaFin} &middot; {selectedSlotData.canchasLibres} cancha{selectedSlotData.canchasLibres !== 1 ? 's' : ''} libre{selectedSlotData.canchasLibres !== 1 ? 's' : ''}
          </p>
        )}
        {slotError && <span className="text-error text-xs mt-1">{slotError}</span>}
      </div>

      {mutation.isError && (
        <div className="alert alert-error text-sm">
          <span>
            {(mutation.error as any)?.response?.data?.message ?? 'Error al crear la reserva.'}
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
