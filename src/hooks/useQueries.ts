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
