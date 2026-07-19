// import React from 'react'
import ReactDOM from 'react-dom'
import { registerSW } from 'virtual:pwa-register'
import App from './App.jsx'
import './index.css'

registerSW({ immediate: true })

// eslint-disable-next-line react/no-deprecated
ReactDOM.render(<App />, document.getElementById('root'))

// ReactDOM.createRoot(document.getElementById('root')).render(
//   <React.StrictMode>
//     <App />
//   </React.StrictMode>,
// )
