import { useEffect } from 'react'
import './App.css'

function App() {

  useEffect(() => {
    console.log("TODO");
  }, [])
  
  return (
    <>
      <h1>TODO APP</h1>
      <div>en progreso</div>
    </>
  )
}

export default App
