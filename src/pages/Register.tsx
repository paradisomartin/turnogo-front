import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { Link, useNavigate } from 'react-router-dom'
import api from '../lib/api'
import type { AuthResponse } from '../types'
import { useAuth } from '../contexts/auth-context'

const schema = z.object({
  nombre: z.string().min(1, 'Requerido'),
  apellido: z.string().min(1, 'Requerido'),
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
  telefono: z.string().optional(),
})

type FormData = z.infer<typeof schema>

export default function Register() {
  const navigate = useNavigate()
  const { login } = useAuth()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      const { data: res } = await api.post<AuthResponse>('/auth/register', data)
      localStorage.setItem('token', res.access_token)
      // re-use login to set user state without a second request
      await login(data.email, data.password)
      navigate('/')
    } catch (err: unknown) {
      const msg =
        (err as { response?: { data?: { message?: string } } })?.response?.data?.message ??
        'Error al registrarse'
      setError('root', { message: Array.isArray(msg) ? msg[0] : msg })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold">Crear cuenta</h2>
          <p className="text-base-content/60 text-sm">Registrate en TurnoGo</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-3">
            <div className="grid grid-cols-2 gap-3">
              <div className="form-control">
                <label className="label"><span className="label-text">Nombre</span></label>
                <input {...register('nombre')} type="text" placeholder="Juan" className="input input-bordered w-full" />
                {errors.nombre && <span className="text-error mt-1 text-xs">{errors.nombre.message}</span>}
              </div>
              <div className="form-control">
                <label className="label"><span className="label-text">Apellido</span></label>
                <input {...register('apellido')} type="text" placeholder="Pérez" className="input input-bordered w-full" />
                {errors.apellido && <span className="text-error mt-1 text-xs">{errors.apellido.message}</span>}
              </div>
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Email</span></label>
              <input {...register('email')} type="email" placeholder="tu@email.com" className="input input-bordered w-full" />
              {errors.email && <span className="text-error mt-1 text-xs">{errors.email.message}</span>}
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Contraseña</span></label>
              <input {...register('password')} type="password" placeholder="••••••" className="input input-bordered w-full" />
              {errors.password && <span className="text-error mt-1 text-xs">{errors.password.message}</span>}
            </div>

            <div className="form-control">
              <label className="label"><span className="label-text">Teléfono <span className="text-base-content/40">(opcional)</span></span></label>
              <input {...register('telefono')} type="tel" placeholder="+54 11 1234-5678" className="input input-bordered w-full" />
            </div>

            {errors.root && (
              <div className="alert alert-error text-sm">
                <span>{errors.root.message}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full mt-1" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Registrarme'}
            </button>
          </form>

          <p className="text-center text-sm text-base-content/60 mt-2">
            ¿Ya tenés cuenta?{' '}
            <Link to="/login" className="link link-primary">Iniciá sesión</Link>
          </p>
        </div>
      </div>
    </div>
  )
}
