import { lazy, Suspense } from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { FlashProvider } from './context/FlashContext';
import Layout from './components/layout/Layout';
import Home from './pages/Home';
import ErrorBoundary from './pages/ErrorBoundary';

const Login = lazy(() => import('./pages/Login'));
const Registro = lazy(() => import('./pages/Registro'));
const EsperaVerificacion = lazy(() => import('./pages/EsperaVerificacion'));
const BibliotecasIndex = lazy(() => import('./pages/BibliotecasIndex'));
const BiblioDetails = lazy(() => import('./pages/BiblioDetails'));
const NuevaBiblioteca = lazy(() => import('./pages/NuevaBiblioteca'));
const EditarBiblioteca = lazy(() => import('./pages/EditarBiblioteca'));
const QueEs = lazy(() => import('./pages/QueEs'));
const Requisitos = lazy(() => import('./pages/Requisitos'));
const Legislacion = lazy(() => import('./pages/Legislacion'));
const NotFound = lazy(() => import('./pages/NotFound'));
const LibrosCatalogo = lazy(() => import('./pages/LibrosCatalogo'));
const LibroShow = lazy(() => import('./pages/LibroShow'));
const NuevoLibro = lazy(() => import('./pages/NuevoLibro'));
const EditarLibro = lazy(() => import('./pages/EditarLibro'));
const Contacto = lazy(() => import('./pages/Contacto'));
const LibrosBiblioteca = lazy(() => import('./pages/LibrosBiblioteca'));

function App() {
  return (
    <Router>
      <AuthProvider>
        <FlashProvider>
          <ErrorBoundary>
            <Suspense fallback={<div className="text-center py-12"><p className="text-gray-600">Cargando...</p></div>}>
              <Routes>
                {/* Home - standalone layout (no global navbar/footer) */}
                <Route path="/" element={<Home />} />
                
                <Route element={<Layout />}>
                  {/* Bibliotecas */}
                  <Route path="/bibliotecas" element={<BibliotecasIndex />} />
                  <Route path="/bibliotecas/nueva" element={<NuevaBiblioteca />} />
                  <Route path="/bibliotecas/que-es" element={<QueEs />} />
                  <Route path="/bibliotecas/requisitos" element={<Requisitos />} />
                  <Route path="/bibliotecas/:id" element={<BiblioDetails />} />
                  <Route path="/bibliotecas/:id/editar" element={<EditarBiblioteca />} />
                  
                  {/* Libros */}
                  <Route path="/libros" element={<LibrosCatalogo />} />
                  <Route path="/libros/:id" element={<LibroShow />} />
                  <Route path="/libros/bibliotecas/:id/nuevo" element={<NuevoLibro />} />
                  <Route path="/libros/bibliotecas/:id/:libroId/editar" element={<EditarLibro />} />
                  <Route path="/bibliotecas/:id/libros" element={<LibrosBiblioteca />} />
                  
                  {/* Auth */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/registro" element={<Registro />} />
                  <Route path="/espera-verificacion" element={<EsperaVerificacion />} />
                  <Route path="/verify/:token" element={<EsperaVerificacion />} />
                  
                  {/* Info */}
                  <Route path="/contacto" element={<Contacto />} />
                  <Route path="/info/legislacion" element={<Legislacion />} />
                  
                  {/* 404 */}
                  <Route path="*" element={<NotFound />} />
                </Route>
              </Routes>
            </Suspense>
          </ErrorBoundary>
        </FlashProvider>
      </AuthProvider>
    </Router>
  );
}

export default App;
