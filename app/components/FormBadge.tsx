interface FormBadgeProps {
  result: 'W' | 'D' | 'L'
}

export function FormBadge({ result }: FormBadgeProps) {
  const styles = {
    W: 'bg-green-100 text-green-800',
    D: 'bg-yellow-100 text-yellow-800',
    L: 'bg-red-100 text-red-800',
  }

  return (
    <span
      className={`inline-flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold ${styles[result]}`}
    >
      {result}
    </span>
  )
}
