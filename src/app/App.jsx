import {
  BrowserRouter,
  Link,
  Route,
  Routes,
} from 'react-router-dom'

function Home() {
  return (
    <main>
      <h1>BrightBridge Vite Test</h1>
      <Link to="/test-route">Open test route</Link>
    </main>
  )
}

function TestRoute() {
  return (
    <main>
      <h1>Test route works</h1>
      <p>If this still appears after a hard refresh, the SPA rewrite works.</p>
      <Link to="/">Return home</Link>
    </main>
  )
}

function NotFound() {
  return (
    <main>
      <h1>Page not found</h1>
      <Link to="/">Return home</Link>
    </main>
  )
}

export default function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/test-route" element={<TestRoute />} />
        <Route path="*" element={<NotFound />} />
      </Routes>
    </BrowserRouter>
  )
}