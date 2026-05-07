import { useState } from 'react'
import { Button } from "@/components/ui/button"
export const Counter = () => {
  const [count, setCount] = useState(0)

  return (
    <Button
      type="button"
      className="counter"
      onClick={() => setCount((count) => count + 1)}
    >
      Count is <span data-testid="count">{count}</span>
    </Button>
  )
}
