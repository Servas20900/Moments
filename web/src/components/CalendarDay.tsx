type CalendarDayProps = {
  day?: number
  status?: 'ocupado' | 'disponible' | 'evento'
  title?: string
  detail?: string
  tag?: string
  muted?: boolean
}

const labelByStatus: Record<NonNullable<CalendarDayProps['status']>, string> = {
  ocupado: 'Ocupado',
  disponible: 'Disponible',
  evento: 'Evento',
}

const CalendarDay = ({ day, status, title, detail, tag, muted }: CalendarDayProps) => {
  const classes = ['calendar-day']
  if (status) classes.push(`calendar-day--${status}`)
  if (muted) classes.push('is-muted')

  return (
    <div className={classes.join(' ')}>
      <div className="calendar-day__top">
        <span className="calendar-day__day">{day ?? ''}</span>
        {status && <span className="calendar-day__status">{labelByStatus[status]}</span>}
      </div>
      <div className="calendar-day__content">
        {tag && <span className="pill pill-ghost">{tag}</span>}
        {title && <p className="calendar-day__title">{title}</p>}
        {detail && <p className="calendar-day__detail">{detail}</p>}
      </div>
    </div>
  )
}

export default CalendarDay
