import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/auth-context'

const schema = z.object({
  email: z.string().email('Email inválido'),
  password: z.string().min(6, 'Mínimo 6 caracteres'),
})

type FormData = z.infer<typeof schema>

export default function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()

  const {
    register,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormData>({ resolver: zodResolver(schema) })

  async function onSubmit(data: FormData) {
    try {
      await login(data.email, data.password)
      navigate('/')
    } catch {
      setError('root', { message: 'Credenciales incorrectas' })
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-base-200">
      <div className="card w-full max-w-sm bg-base-100 shadow-xl">
        <div className="card-body">
          <h2 className="card-title text-2xl font-bold">TurnoGo</h2>
          <p className="text-base-content/60 text-sm">Iniciá sesión para continuar</p>

          <form onSubmit={handleSubmit(onSubmit)} className="mt-4 flex flex-col gap-4">
            <div className="form-control">
              <label className="label">
                <span className="label-text">Email</span>
              </label>
              <input
                {...register('email')}
                type="email"
                placeholder="tu@email.com"
                className="input input-bordered w-full"
              />
              {errors.email && <span className="text-error mt-1 text-xs">{errors.email.message}</span>}
            </div>

            <div className="form-control">
              <label className="label">
                <span className="label-text">Contraseña</span>
              </label>
              <input
                {...register('password')}
                type="password"
                placeholder="••••••"
                className="input input-bordered w-full"
              />
              {errors.password && <span className="text-error mt-1 text-xs">{errors.password.message}</span>}
            </div>

            {errors.root && (
              <div className="alert alert-error text-sm">
                <span>{errors.root.message}</span>
              </div>
            )}

            <button type="submit" className="btn btn-primary w-full" disabled={isSubmitting}>
              {isSubmitting ? <span className="loading loading-spinner loading-sm" /> : 'Ingresar'}
            </button>
          </form>
        </div>
      </div>
    </div>
  )
}
