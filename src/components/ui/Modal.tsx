import { useEffect, useRef, type ReactNode } from 'react'

interface ModalProps {
  open: boolean
  onClose: () => void
  title?: string
  description?: string
  children: ReactNode
  /** Extra classes for the modal box */
  className?: string
  /** Prevent closing by clicking the backdrop */
  persistent?: boolean
}

export default function Modal({
  open,
  onClose,
  title,
  description,
  children,
  className = '',
  persistent = false,
}: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null)

  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    if (open) dialog.showModal()
    else dialog.close()
  }, [open])

  // Sync close event triggered by ESC key
  useEffect(() => {
    const dialog = dialogRef.current
    if (!dialog) return
    const handleClose = () => onClose()
    dialog.addEventListener('close', handleClose)
    return () => dialog.removeEventListener('close', handleClose)
  }, [onClose])

  function handleBackdropClick(e: React.MouseEvent<HTMLDialogElement>) {
    if (persistent) return
    if (e.target === dialogRef.current) onClose()
  }

  return (
    <dialog ref={dialogRef} className="modal" onClick={handleBackdropClick}>
      <div className={`modal-box ${className}`}>
        {/* Header */}
        {(title || !persistent) && (
          <div className="flex items-start justify-between mb-4">
            <div>
              {title && <h3 className="text-lg font-bold">{title}</h3>}
              {description && <p className="text-sm text-base-content/60 mt-0.5">{description}</p>}
            </div>
            <button
              className="btn btn-sm btn-circle btn-ghost ml-4 shrink-0"
              onClick={onClose}
              aria-label="Cerrar"
            >
              ✕
            </button>
          </div>
        )}

        {children}
      </div>
    </dialog>
  )
}
