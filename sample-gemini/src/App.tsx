import { useState, useEffect } from 'react'

function App() {
  const [count, setCount] = useState(0)

  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prevCount) => prevCount + 1)
    }, 1000)

    return () => clearInterval(timer)
  }, [])

  return (
    <>
      <h1>Timer</h1>
      <div className="card">
        <p>Count is: {count}</p>
      </div>
    </>
  )
}

export default App
