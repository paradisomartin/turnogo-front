import { useQuery } from '@tanstack/react-query'
import api from '../lib/api'
import type { Booking, Club, Court } from '../types'

export function useClubs() {
  return useQuery({
    queryKey: ['clubs'],
    queryFn: () => api.get<Club[]>('/clubs').then((r) => r.data),
  })
}

export function useCourts(clubId?: string) {
  return useQuery({
    queryKey: ['courts', clubId],
    queryFn: () =>
      api
        .get<Court[]>('/courts', { params: clubId ? { clubId } : undefined })
        .then((r) => r.data),
  })
}

export function useBookings() {
  return useQuery({
    queryKey: ['bookings'],
    queryFn: () => api.get<Booking[]>('/bookings').then((r) => r.data),
  })
}

export interface Slot {
  horaInicio: string
  horaFin:    string
  disponible: boolean
  canchasLibres: number
}

export function useAvailableSlots(clubId: string | undefined, fecha: string | undefined) {
  return useQuery({
    queryKey: ['available-slots', clubId, fecha],
    queryFn: () =>
      api
        .get<Slot[]>('/bookings/available-slots', { params: { clubId, fecha } })
        .then((r) => r.data),
    enabled: Boolean(clubId && fecha),
  })
}
