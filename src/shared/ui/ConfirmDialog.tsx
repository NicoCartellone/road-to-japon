interface Props {
  message?: string
  onConfirm: () => void
  onCancel: () => void
}

export default function ConfirmDialog({ message = '¿Eliminar este ítem?', onConfirm, onCancel }: Props) {
  return (
    <div className="confirm-overlay" onClick={onCancel}>
      <div className="confirm-dialog card" onClick={(e) => e.stopPropagation()}>
        <p className="confirm-msg">{message}</p>
        <div className="confirm-actions">
          <button className="confirm-cancel" onClick={onCancel}>Cancelar</button>
          <button className="confirm-ok" onClick={onConfirm}>Eliminar</button>
        </div>
      </div>
    </div>
  )
}
