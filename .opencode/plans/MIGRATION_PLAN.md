# Migration Plan: EJS to React (Vite SPA + REST API)

## Overview

Migrate the "Bibliotecas Populares Cordoba" app from Express/EJS server-rendered views to a **Vite + React SPA** with **Tailwind CSS**, consuming **REST API** endpoints on the existing Express backend. Migration is **incremental** -- EJS and React coexist until all pages are migrated.

---

## 1. Repository Audit & Target Architecture

### 1.1 EJS Inventory

**22 EJS templates** organized as:

| Category | Files | Complexity |
|----------|-------|------------|
| Layout/Partials | `boilerplate.ejs`, `navbar.ejs`, `footer.ejs`, `flash.ejs` | Global |
| Homepage | `home.ejs` (standalone, no boilerplate) | Low |
| Bibliotecas CRUD | `index.ejs`, `details.ejs`, `nueva.ejs`, `editar.ejs` | High (maps, forms, file uploads) |
| Info pages | `que-es.ejs`, `requisitos.ejs`, `legislacion.ejs` | Static/low |
| Libros CRUD | `index.ejs`, `showPage.ejs`, `nuevo.ejs`, `editar.ejs` | Medium |
| Auth/Users | `login.ejs`, `registro.ejs`, `esperaVerificacion.ejs`, `contacto.ejs` | Medium |
| Error | `error.ejs` | Low |

**5 client-side JS files:** `validateForms.js`, `biblioIndex.js`, `clusterMap.js`, `showPageMap.js`, `maptiler-sdk.umd.min.js`

**5 CSS files:** `app.css`, `home.css`, `stars.css`, `starability-fade.min.css`, `maptiler-sdk.css`

### 1.2 Target Architecture

```
proyecto-bibliotecas-populares/
  server/                     # Express backend (API only)
    index.js                  # Modified: serves Vite build + API routes
    routes/
      api/
        bibliotecas.js        # JSON responses instead of res.render
        libros.js
        usuarios.js
        reviews.js
        info.js
  client/                     # Vite React SPA
    index.html
    src/
      main.jsx
      App.jsx                 # React Router setup
      api/                    # API client functions (fetch wrappers)
      components/
        layout/               # Navbar, Footer, Layout
        ui/                   # Reusable UI (Button, Card, Modal, etc.)
        maps/                 # ClusterMap, ShowPageMap (MapTiler)
        forms/                # StarRating, SearchForm, etc.
      pages/                  # Route-level components
      hooks/                  # Custom hooks (useAuth, useFlash, etc.)
      context/                # AuthContext, FlashContext
      styles/                 # Tailwind config + global styles
  tailwind.config.js
  vite.config.js
  package.json                # Updated with React, Vite, Tailwind deps
```

**Integration approach:** Express serves the Vite build output (`client/dist`) for all non-API routes. The React SPA handles client-side routing. API routes return JSON.

### 1.3 Shared UI & State Requirements

| Concern | Strategy |
|---------|----------|
| **Auth state** | `AuthContext` -- fetch `/api/auth/current-user` on mount, store in React context |
| **Flash messages** | `FlashContext` -- API responses include flash data; React renders alerts |
| **Page title** | `react-helmet-async` for `<title>` management |
| **Routing** | `react-router-dom` v6 with nested routes |
| **Forms** | React Hook Form + Zod for validation (replaces `validated-form` + Joi) |
| **File uploads** | `FormData` + `fetch` to upload endpoints (Multer stays on server) |
| **Maps** | `@maptiler/sdk` via `useRef` + `useEffect` pattern |
| **Star ratings** | Custom `StarRating` component (replaces starability CSS) |
| **Responsive** | Tailwind responsive utilities (replaces Bootstrap grid) |

---

## 2. Migration Phases (Atomic Steps)

---

### PHASE 1: Setup & Infrastructure

---

#### Task 1.1: Initialize Vite + React Project

- **Target Files:** New files: `client/`, `vite.config.js`, root `package.json`
- **Props & Data Interface:** N/A (setup only)
- **Dependencies Required:** `vite`, `@vitejs/plugin-react`, `react`, `react-dom`, `react-router-dom`
- **Execution Checklist:**
  1. Run `npm create vite@latest client -- --template react` inside the project root
  2. `cd client && npm install`
  3. Install `react-router-dom`: `npm install react-router-dom`
  4. Configure `vite.config.js` with proxy to Express dev server on port 3000:
     ```js
     import { defineConfig } from 'vite'
     import react from '@vitejs/plugin-react'
     export default defineConfig({
       plugins: [react()],
       server: {
         port: 5173,
         proxy: {
           '/api': 'http://localhost:3000',
           '/auth': 'http://localhost:3000'
         }
       },
       build: {
         outDir: '../server/public/dist'
       }
     })
     ```
  5. Update root `package.json` scripts to include `"dev:client": "cd client && npm run dev"`
  6. Verify `npm run dev` in client folder starts Vite dev server
- **Verification & Testing:** Vite dev server starts without errors. `http://localhost:5173` shows React app. Proxy to Express works.

---

#### Task 1.2: Install and Configure Tailwind CSS

- **Target Files:** `client/tailwind.config.js`, `client/postcss.config.js`, `client/src/index.css`
- **Props & Data Interface:** N/A
- **Dependencies Required:** `tailwindcss`, `postcss`, `autoprefixer`, `@tailwindcss/forms` (optional, for form styling)
- **Execution Checklist:**
  1. `cd client && npm install -D tailwindcss postcss autoprefixer`
  2. `npx tailwindcss init -p`
  3. Configure `tailwind.config.js`:
     ```js
     /** @type {import('tailwindcss').Config} */
     export default {
       content: ["./index.html", "./src/**/*.{js,ts,jsx,tsx}"],
       theme: {
         extend: {
           colors: {
             primary: '#0d6efd', // Match Bootstrap primary
           }
         }
       },
       plugins: [],
     }
     ```
  4. Replace `client/src/index.css` contents with Tailwind directives:
     ```css
     @tailwind base;
     @tailwind components;
     @tailwind utilities;
     ```
  5. Remove default Vite CSS files (`App.css`, etc.)
  6. Verify Tailwind classes work in `App.jsx`
- **Verification & Testing:** Tailwind utility classes render correctly. No CSS conflicts.

---

#### Task 1.3: Configure Express to Serve React Build

- **Target Files:** `index.js` (modify), new `server/public/dist/` directory
- **Props & Data Interface:** N/A
- **Dependencies Required:** None new
- **Execution Checklist:**
  1. In `index.js`, add static serving for the Vite build output BEFORE the 404 handler:
     ```js
     // After existing static middleware:
     app.use(express.static(path.join(__dirname, 'client/dist')));
     ```
  2. Add catch-all route AFTER all API routes but BEFORE the 404 handler:
     ```js
     // Catch-all: serve React app for any non-API route
     app.get('*', (req, res, next) => {
       if (req.path.startsWith('/api')) return next();
       res.sendFile(path.join(__dirname, 'client/dist/index.html'));
     });
     ```
  3. In production, `npm run build` in `client/` generates `client/dist/`
  4. Test by building client and accessing `http://localhost:3000` -- should show React app
- **Verification & Testing:** Production build serves React app. API routes still work.

---

#### Task 1.4: Create API Route Structure

- **Target Files:** New `routes/api/` directory, new route files
- **Props & Data Interface:** N/A (route stubs)
- **Dependencies Required:** None
- **Execution Checklist:**
  1. Create `routes/api/` directory
  2. Create stub route files that return JSON:
     - `routes/api/bibliotecas.js` -- stub all biblioteca endpoints
     - `routes/api/libros.js` -- stub all libro endpoints
     - `routes/api/usuarios.js` -- stub auth endpoints
     - `routes/api/reviews.js` -- stub review endpoints
     - `routes/api/info.js` -- stub info endpoints
  3. Mount API routes in `index.js`:
     ```js
     app.use('/api/bibliotecas', require('./routes/api/bibliotecas'));
     app.use('/api/libros', require('./routes/api/libros'));
     app.use('/api', require('./routes/api/usuarios'));
     app.use('/api/bibliotecas/:id/reviews', require('./routes/api/reviews'));
     app.use('/api/info', require('./routes/api/info'));
     ```
  4. Each stub returns `{ status: 'ok', route: 'route-name' }` initially
- **Verification & Testing:** `GET /api/bibliotecas` returns JSON. Existing EJS routes still work.

---

#### Task 1.5: Create React API Client Layer

- **Target Files:** New `client/src/api/client.js`, `client/src/api/bibliotecas.js`, `client/src/api/libros.js`, `client/src/api/auth.js`, `client/src/api/reviews.js`
- **Props & Data Interface:** N/A (utility code)
- **Dependencies Required:** None
- **Execution Checklist:**
  1. Create `client/src/api/client.js` -- base fetch wrapper:
     ```js
     const BASE = '/api';
     export async function apiGet(path) { ... }
     export async function apiPost(path, data) { ... }
     export async function apiPut(path, data) { ... }
     export async function apiDelete(path) { ... }
     export async function apiUpload(path, formData) { ... }
     ```
  2. Create domain-specific API modules:
     - `bibliotecas.js`: `getBibliotecas(query)`, `getBiblioteca(id)`, `createBiblioteca(data)`, `updateBiblioteca(id, data)`, `deleteBiblioteca(id)`
     - `libros.js`: `getLibros(query)`, `getLibro(id)`, `createLibro(biblioId, data)`, `updateLibro(biblioId, libroId, data)`, `deleteLibro(biblioId, libroId)`
     - `auth.js`: `login(data)`, `register(data)`, `getCurrentUser()`, `logout()`
     - `reviews.js`: `createReview(biblioId, data)`, `deleteReview(biblioId, reviewId)`
  3. Handle credentials: `credentials: 'same-origin'` in all fetch calls (session cookies)
  4. Handle file uploads: use `FormData` and set proper headers
- **Verification & Testing:** API client modules can be imported and called from React components.

---

#### Task 1.6: Create React Auth Context & Hooks

- **Target Files:** New `client/src/context/AuthContext.jsx`, `client/src/context/FlashContext.jsx`, `client/src/hooks/useAuth.js`
- **Props & Data Interface:** Auth user: `{ _id, username, email, isVerified }` or `null`
- **Dependencies Required:** React context API
- **Execution Checklist:**
  1. Create `AuthContext.jsx`:
     - `AuthProvider` wraps app, stores `user` state
     - On mount, calls `GET /api/auth/current-user` to restore session
     - Exposes: `user`, `loading`, `login()`, `logout()`, `register()`
  2. Create `FlashContext.jsx`:
     - Stores `success` and `error` message arrays
     - `showSuccess(msg)`, `showError(msg)`, `clearFlash()`
     - Auto-dismiss after 5 seconds (using `setTimeout`)
  3. Create `useAuth()` hook for consuming auth context
  4. Test: login flow stores user, logout clears it
- **Verification & Testing:** Auth state persists across page reloads. Flash messages display and auto-dismiss.

---

#### Task 1.7: Build Root Layout with React Router

- **Target Files:** New `client/src/App.jsx`, `client/src/components/layout/Layout.jsx`, `client/src/components/layout/Navbar.jsx`, `client/src/components/layout/Footer.jsx`
- **Props & Data Interface:** `currentUser` from auth context
- **Dependencies Required:** `react-router-dom`, Tailwind CSS
- **Execution Checklist:**
  1. Create `Layout.jsx` -- mirrors `boilerplate.ejs` structure:
     ```jsx
     <div className="min-h-screen flex flex-col">
       <Navbar />
       <main className="container mx-auto mt-4 flex-grow">
         <FlashMessages />
         <Outlet />
       </main>
       <Footer />
     </div>
     ```
  2. Create `Navbar.jsx` -- mirrors `navbar.ejs`:
     - Sticky top, bg-primary, nav links (Inicio, Bibliotecas dropdown, Legislacion, Libros, Contacto)
     - Auth-dependent: Login/Registrate vs Logout
     - Mobile hamburger menu (Tailwind responsive)
     - Use `NavLink` from react-router-dom for active state
  3. Create `Footer.jsx` -- mirrors `footer.ejs`:
     - bg-primary, centered text, developer credit link
  4. Create `FlashMessages.jsx` -- mirrors `flash.ejs`:
     - Renders success/error alerts from FlashContext
     - Bootstrap-style dismissible alerts (recreate with Tailwind)
  5. Set up `App.jsx` with `BrowserRouter`:
     ```jsx
     <AuthProvider>
       <FlashProvider>
         <Routes>
           <Route element={<Layout />}>
             <Route path="/" element={<Home />} />
             <Route path="/bibliotecas" element={<BibliotecasIndex />} />
             <Route path="/bibliotecas/nueva" element={<NuevaBiblioteca />} />
             <Route path="/bibliotecas/:id" element={<BiblioDetails />} />
             <Route path="/bibliotecas/:id/editar" element={<EditarBiblioteca />} />
             <Route path="/bibliotecas/:id/libros" element={<LibrosIndex />} />
             <Route path="/bibliotecas/:id/libros/nuevo" element={<NuevoLibro />} />
             <Route path="/bibliotecas/:id/libros/:libroId" element={<LibroShow />} />
             <Route path="/bibliotecas/:id/libros/:libroId/editar" element={<EditarLibro />} />
             <Route path="/libros" element={<LibrosCatalogo />} />
             <Route path="/libros/buscar" element={<LibrosCatalogo />} />
             <Route path="/libros/:id" element={<LibroShow />} />
             <Route path="/login" element={<Login />} />
             <Route path="/registro" element={<Registro />} />
             <Route path="/contacto" element={<Contacto />} />
             <Route path="/info/legislacion" element={<Legislacion />} />
             <Route path="/bibliotecas/que-es" element={<QueEs />} />
             <Route path="/bibliotecas/requisitos" element={<Requisitos />} />
             <Route path="*" element={<NotFound />} />
           </Route>
         </Routes>
       </FlashProvider>
     </AuthProvider>
     ```
  6. Ensure `document.getElementById('root')` exists in `client/index.html`
- **Verification & Testing:** Layout renders with navbar, footer, flash area. All routes are accessible. Visual matches existing EJS layout (before Tailwind migration of content pages).

---

### PHASE 2: Global Layouts & Common Components

---

#### Task 2.1: Build Star Rating Component

- **Target Files:** New `client/src/components/ui/StarRating.jsx`
- **Props & Data Interface:** `value: number`, `onChange: (val) => void`, `readonly?: boolean`
- **Dependencies Required:** Tailwind CSS
- **Execution Checklist:**
  1. Create `StarRating.jsx` -- 5 clickable star icons (Bootstrap Icons `bi-star`/`bi-star-fill` or inline SVG)
  2. Support both interactive mode (review form) and readonly mode (review display)
  3. For readonly, render stars based on `rating` value (1-5)
  4. Use Tailwind for sizing and colors (yellow fill for active, gray for inactive)
  5. For interactive: `onMouseEnter`/`onMouseLeave` for hover preview, `onClick` to select
  6. Match the visual appearance of `starability-fade.min.css`
- **Verification & Testing:** Component renders 5 stars. Click sets value. Hover previews selection. Readonly mode displays correctly.

---

#### Task 2.2: Build Reusable UI Components

- **Target Files:** New `client/src/components/ui/Button.jsx`, `Card.jsx`, `Modal.jsx`, `Input.jsx`, `Select.jsx`, `TextArea.jsx`, `Alert.jsx`
- **Props & Data Interface:** Standard component props
- **Dependencies Required:** Tailwind CSS, `@tailwindcss/forms` (optional)
- **Execution Checklist:**
  1. `Button.jsx` -- variants: `primary`, `secondary`, `success`, `danger`, `info`; sizes: `sm`, `md`, `lg`; full-width option
  2. `Card.jsx` -- with optional `imgSrc`, `imgAlt`, `title`, children
  3. `Modal.jsx` -- Bootstrap-style modal using Tailwind (backdrop, centered, close button)
  4. `Input.jsx` -- form input with label, error state, valid feedback, placeholder
  5. `Select.jsx` -- form select with label and options
  6. `TextArea.jsx` -- form textarea with label
  7. `Alert.jsx` -- dismissible alert (success/danger), mirrors `flash.ejs`
  8. All components accept `className` prop for composition
- **Verification & Testing:** Each component renders correctly. Visual parity with Bootstrap equivalents using Tailwind.

---

#### Task 2.3: Build Map Components

- **Target Files:** New `client/src/components/maps/ClusterMap.jsx`, `client/src/components/maps/ShowPageMap.jsx`
- **Props & Data Interface:**
  - `ClusterMap`: `bibliotecas: GeoJSON`, `apiKey: string`
  - `ShowPageMap`: `coordinates: [lon, lat]`, `nombre: string`, `apiKey: string`
- **Dependencies Required:** `@maptiler/sdk` (npm package for ESM), `maptiler-sdk.css`
- **Execution Checklist:**
  1. Install MapTiler SDK: `npm install @maptiler/sdk`
  2. Create `ClusterMap.jsx`:
     - Use `useRef` for map container div, `useEffect` for map initialization
     - Import MapTiler SDK: `import * as maptilersdk from '@maptiler/sdk'`
     - Initialize map on mount, add source, layers, event handlers
     - Clean up map on unmount (`map.remove()`)
     - Filter geometries from props, create GeoJSON
     - Replicate cluster coloring logic from `clusterMap.js`
  3. Create `ShowPageMap.jsx`:
     - Single point marker with popup
     - Replicate `showPageMap.js` logic
  4. Create `client/src/components/maps/MapApiKeyProvider.jsx` or use env var:
     - `VITE_MAPTILER_API_KEY` in `.env` file
  5. Import MapTiler CSS: `import '@maptiler/sdk/dist/maptiler-sdk.css'`
- **Verification & Testing:** Cluster map renders with clustered points. Show page map renders single marker with popup. Both responsive.

---

### PHASE 3: Static / Low-Complexity Pages

---

#### Task 3.1: Build Home Page

- **Target Files:** New `client/src/pages/Home.jsx`, new `client/src/styles/home.css`
- **Props & Data Interface:** `currentUser` from auth context
- **Dependencies Required:** Tailwind CSS, `NavLink`
- **Execution Checklist:**
  1. Create `Home.jsx` -- mirrors `home.ejs`:
     - Full-viewport background image (Cloudinary URL)
     - Dark overlay via CSS `linear-gradient`
     - Cover layout: centered text, nav links, "Ver bibliotecas" button
     - Auth-dependent nav links
  2. Create `home.css` for background-image styles (keep as CSS since it's a unique full-viewport effect)
  3. Use Tailwind for layout: `min-h-screen`, `flex`, `text-center`, `text-white`, `bg-dark`
  4. Note: Home page does NOT use the global Layout -- create a custom layout or use an alternate route layout
  5. Link to `/bibliotecas` for the CTA button
- **Verification & Testing:** Home page renders with background image, overlay, nav, and CTA. Auth links work. Visual matches `home.ejs`.

---

#### Task 3.2: Build Static Info Pages (Que Es, Requisitos, Legislacion)

- **Target Files:** New `client/src/pages/QueEs.jsx`, `Requisitos.jsx`, `Legislacion.jsx`
- **Props & Data Interface:** Static content (no server data)
- **Dependencies Required:** Tailwind CSS
- **Execution Checklist:**
  1. Create `QueEs.jsx` -- mirror `bibliotecas/que-es.ejs`:
     - Card with two sections: "Que es una biblioteca popular" and "Como constituir una biblioteca popular"
     - Static text content (copy from EJS)
     - Tailwind card layout: centered, max-width, responsive
  2. Create `Requisitos.jsx` -- mirror `bibliotecas/requisitos.ejs`:
     - Card with "Requisitos para ser una biblioteca popular" heading
     - Bulleted list of 7 requirements
  3. Create `Legislacion.jsx` -- mirror `info/legislacion.ejs`:
     - Multiple cards: National legislation, Provincial legislation, Municipal ordinances, Organizations
     - External links with `target="_blank"` and `rel="noopener noreferrer"`
  4. All pages use global Layout (navbar + footer)
- **Verification & Testing:** All three pages render correctly. Content matches EJS originals. Links work. Responsive.

---

#### Task 3.3: Build Error Page

- **Target Files:** New `client/src/pages/NotFound.jsx`, `ErrorPage.jsx`
- **Props & Data Interface:** Error status code, message
- **Dependencies Required:** Tailwind CSS, `react-router-dom` (`useRouteError`)
- **Execution Checklist:**
  1. Create `NotFound.jsx` -- 404 page:
     - Centered alert with "Page not found" message
     - Link back to home
  2. Create `ErrorPage.jsx` -- generic error boundary:
     - Error boundary component using `componentDidCatch`
     - Displays error status and message (non-production only shows stack)
  3. Configure error element in `App.jsx`:
     ```jsx
     <Route element={<Layout />}>
       ... routes ...
       <Route path="*" element={<NotFound />} />
     </Route>
     ```
- **Verification & Testing:** 404 page renders for unknown routes. Error boundary catches rendering errors.

---

### PHASE 4: Dynamic & Interactive Pages

---

#### Task 4.1: Implement Auth API Endpoints

- **Target Files:** New `routes/api/usuarios.js`
- **Props & Data Interface:** Login: `{ username, password }`. Register: `{ username, email, password }`. Current user: `{ _id, username, email, isVerified }`
- **Dependencies Required:** Existing `passport`, `express-session`
- **Execution Checklist:**
  1. Create `routes/api/usuarios.js` with routes:
     - `POST /api/auth/login` -- passport.authenticate('local'), return JSON user + flash messages
     - `POST /api/auth/register` -- create user, send verification email, return JSON
     - `GET /api/auth/current-user` -- return `req.user` or `null`
     - `GET /api/auth/logout` -- `req.logout()`, return success JSON
  2. Key: login endpoint must use `req.logIn()` callback to return JSON instead of redirect
  3. Return flash messages in response body: `{ success: [...], error: [...] }`
  4. Mount in `index.js`: `app.use('/api/auth', require('./routes/api/usuarios'))`
- **Verification & Testing:** Login returns user JSON. `/api/auth/current-user` returns logged-in user. Logout clears session. Register creates user and returns success.

---

#### Task 4.2: Build Login & Registration Pages

- **Target Files:** New `client/src/pages/Login.jsx`, `Registro.jsx`, `EsperaVerificacion.jsx`
- **Props & Data Interface:** Form fields: username, email, password. Auth context methods.
- **Dependencies Required:** `react-hook-form`, Tailwind CSS
- **Execution Checklist:**
  1. Install `react-hook-form`: `npm install react-hook-form`
  2. Create `Login.jsx`:
     - Card layout with image (Cloudinary URL), form
     - Fields: username (required), password (required)
     - Password visibility toggle (eye icon, state toggle)
     - Submit calls `login()` from auth context, redirects to `/bibliotecas` on success
     - Show flash error on failure
  3. Create `Registro.jsx`:
     - Card with image, form
     - Fields: username (required), email (required, email pattern), password (required)
     - Password visibility toggle
     - Submit calls `register()` from auth context
     - On success, navigate to `/espera-verificacion`
  4. Create `EsperaVerificacion.jsx`:
     - Simple message page: "Check your email for verification link"
  5. Form validation using `react-hook-form` with `register` and `errors`
  6. Tailwind classes: match existing Bootstrap card/form styling
- **Verification & Testing:** Login form works, stores auth state, redirects. Registration creates account. Verification pending page displays. Password toggle works.

---

#### Task 4.3: Build Bibliotecas Index Page (API + React)

- **Target Files:** Modify `routes/api/bibliotecas.js`, new `client/src/pages/BibliotecasIndex.jsx`
- **Props & Data Interface:** API returns `{ bibliotecas[], currentPage, totalPages, nombre, localidad, codigoConabip }`
- **Dependencies Required:** `react-router-dom` (useSearchParams), `@maptiler/sdk`
- **Execution Checklist:**
  1. Implement API endpoint in `routes/api/bibliotecas.js`:
     - `GET /api/bibliotecas?page=&nombre=&localidad=&codigoConabip=`
     - Same logic as current `biblioCont.index` but returns JSON
     - Include geometry data for map
     - On empty results, return `{ bibliotecas: [], error: 'No se encontraron...' }`
  2. Create `BibliotecasIndex.jsx`:
     - Layout: sidebar search form + main content area + cluster map
     - Search form: nombre, localidad, codigoConabip inputs + submit button
     - Form submits via URL search params (use `useSearchParams`)
     - Biblioteca cards: image, nombre, direccion, localidad, CONABIP code, "Ver biblioteca" button
     - Pagination component at bottom
     - ClusterMap component at top
     - Mobile responsive: sidebar collapses on small screens
  3. Use `useEffect` to fetch bibliotecas when search params change
  4. Replicate `biblioIndex.js` logic: mobile title-to-link conversion (or do this purely in CSS/React)
  5. Card layout matches existing CSS: `col-md-6 col-lg-6 mb-4`, image left, text right
- **Verification & Testing:** Search filters work. Pagination works. Map shows clusters. Cards display correctly. Mobile responsive.

---

#### Task 4.4: Build Biblioteca Details Page

- **Target Files:** Modify `routes/api/bibliotecas.js`, new `client/src/pages/BiblioDetails.jsx`
- **Props & Data Interface:** API returns `{ biblioteca, currentUser, redes }`. Biblioteca populated with reviews (authors populated), catalogoLibros, autor.
- **Dependencies Required:** `react-router-dom` (useParams), `@maptiler/sdk`, `react-hook-form`
- **Execution Checklist:**
  1. Implement API endpoint:
     - `GET /api/bibliotecas/:id` -- returns populated biblioteca with reviews, books
  2. Create `BiblioDetails.jsx`:
     - Two-column layout: left (images carousel + info card), right (map + reviews)
     - **Image carousel:** Bootstrap carousel logic replicated with state: `activeIndex`, prev/next buttons
     - **Info card:** nombre, direccion, localidad, telefono, actividades, horario, cuota, redes links
     - **Social links:** Render instagram/facebook/X/mail links with correct URLs
     - **Edit/Delete buttons:** Only shown if `currentUser._id === biblioteca.autor._id`
     - **Map:** ShowPageMap component with biblioteca coordinates
     - **Review form:** StarRating component + textarea + submit (only if logged in)
     - **Reviews list:** Display reviews with author name, body, delete button (if author)
     - **Book catalog section:** "Ver Catalogo" and "Agregar Libro" buttons
  3. Implement review creation: `POST /api/bibliotecas/:id/reviews` with `{ review: { rating, body } }`
  4. Implement review deletion: `DELETE /api/bibliotecas/:id/reviews/:reviewId`
  5. Implement biblioteca deletion: `DELETE /api/bibliotecas/:id` with confirmation
  6. Import `starability-fade.min.css` for star rating display (or use custom StarRating in readonly mode)
- **Verification & Testing:** All biblioteca data displays. Carousel works. Map shows. Reviews can be created and deleted. Edit/delete buttons only visible to author. Social links work.

---

#### Task 4.5: Build Biblioteca Create/Edit Forms

- **Target Files:** Modify `routes/api/bibliotecas.js`, new `client/src/pages/NuevaBiblioteca.jsx`, `EditarBiblioteca.jsx`
- **Props & Data Interface:** Form fields: nombre, localidad, geometry coordinates, direccion, horario, cuota, telefono, opcionesTelefono, redes, actividades, registroConabip, images
- **Dependencies Required:** `react-hook-form`, Multer on server
- **Execution Checklist:**
  1. Implement API endpoints:
     - `POST /api/bibliotecas` -- create (with `FormData` for images)
     - `PUT /api/bibliotecas/:id` -- update (with `FormData` for images)
  2. Create `NuevaBiblioteca.jsx`:
     - Card layout with centered form
     - Fields matching `nueva.ejs`: nombre, localidad, coordinates (optional), direccion, horario, cuota, telefono, opcionesTelefono (select), redes (4 checkboxes with inputs), actividades, registroConabip, images (file input, multiple)
     - Form submission uses `FormData` (not JSON) for file uploads
     - Include `enctype="multipart/form-data"` behavior via `FormData` API
     - On success: flash success, redirect to new biblioteca page
  3. Create `EditarBiblioteca.jsx`:
     - Same form as create but pre-populated with existing data
     - Show existing image thumbnails with delete checkboxes
     - `deleteImages[]` array sent with form
     - On success: flash success, redirect to biblioteca page
  4. Social media inputs: 4 input groups with checkbox + text input + hidden nombre field
  5. Coordinate inputs: longitude/latitude number inputs (optional)
  6. Validation: required fields marked, phone pattern validation
- **Verification & Testing:** Create form submits with images. Edit form loads existing data. Image upload works. Delete images works. Form validation works. Redirect after success.

---

#### Task 4.6: Build Libros Pages (Catalog, Show, Create, Edit)

- **Target Files:** Modify `routes/api/libros.js`, new `client/src/pages/LibrosCatalogo.jsx`, `LibroShow.jsx`, `NuevoLibro.jsx`, `EditarLibro.jsx`
- **Props & Data Interface:** Libro: `{ titulo, autor, codigoCat, genero, publishYear, biblioteca }`
- **Dependencies Required:** `react-hook-form`, `react-router-dom`
- **Execution Checklist:**
  1. Implement API endpoints in `routes/api/libros.js`:
     - `GET /api/libros` -- general catalog (with search params)
     - `GET /api/libros/buscar?titulo=&autor=&genero=` -- search
     - `GET /api/libros/:id` -- show single book
     - `POST /api/bibliotecas/:id/libros` -- create book
     - `PUT /api/bibliotecas/:id/libros/:libroId` -- update book
     - `DELETE /api/bibliotecas/:id/libros/:libroId` -- delete book
     - `GET /api/bibliotecas/:id/libros` -- books for specific biblioteca
  2. Create `LibrosCatalogo.jsx`:
     - Card layout with search form (titulo, autor, genero)
     - Search results list with links to book detail
     - "Ir al archivo de todas las bibliotecas" link (for biblioteca-specific catalogs)
  3. Create `LibroShow.jsx`:
     - Card with book details: titulo, autor, codigoCat, genero, publishYear
     - Link to parent biblioteca
     - Edit/Delete buttons (only for biblioteca author)
     - "Volver al Catalogo" link
  4. Create `NuevoLibro.jsx`:
     - Form: titulo, autor, codigoCat, genero, publishYear
     - Submit to `POST /api/bibliotecas/:id/libros`
  5. Create `EditarLibro.jsx`:
     - Pre-populated form with existing book data
     - Submit to `PUT /api/bibliotecas/:id/libros/:libroId`
  6. Form validation: titulo, autor, codigoCat required
- **Verification & Testing:** All libro CRUD operations work. Search filters books. Edit/delete only visible to author. Navigation between book and biblioteca works.

---

#### Task 4.7: Build Contact Page

- **Target Files:** Modify `routes/api/usuarios.js`, new `client/src/pages/Contacto.jsx`
- **Props & Data Interface:** Form fields: nombre, email, mensaje
- **Dependencies Required:** `react-hook-form`
- **Execution Checklist:**
  1. Implement API endpoint:
     - `POST /api/contacto` -- sends email via nodemailer, returns success JSON
  2. Create `Contacto.jsx`:
     - Card layout with image, form
     - Fields: nombre (required), email (required, email type), mensaje (required, textarea)
     - Submit sends email via API, shows success flash, redirects to `/bibliotecas`
- **Verification & Testing:** Contact form submits. Email sent via nodemailer. Success flash shows.

---

#### Task 4.8: Build Email Verification Handler

- **Target Files:** Modify `routes/api/usuarios.js`
- **Props & Data Interface:** Token from URL params
- **Dependencies Required:** None
- **Execution Checklist:**
  1. Implement API endpoint:
     - `GET /api/auth/verify/:token` -- verify user email, return success JSON
  2. In React, add route: `/verify/:token` -> component that calls API and shows result
  3. Or: handle this server-side as a redirect (email links hit Express directly, not React)
- **Verification & Testing:** Clicking verification link verifies account. Redirect to login page.

---

### PHASE 5: Backend Route Decoupling

---

#### Task 5.1: Convert Bibliotecas Routes to JSON API

- **Target Files:** Modify `routes/api/bibliotecas.js`
- **Props & Data Interface:** All biblioteca endpoints return JSON instead of `res.render()`
- **Dependencies Required:** Existing middleware (validateBiblio, esAutor, etc.)
- **Execution Checklist:**
  1. Convert each handler from `res.render()` to `res.json()`:
     - `index`: return `{ bibliotecas, currentPage, totalPages, nombre, localidad, codigoConabip, error }`
     - `biblioDetails`: return `{ biblioteca, currentUser, redes, title }`
     - `nuevoForm`: return `{ biblioteca: { images: [] } }` (or skip -- React handles form state)
     - `editForm`: return `{ biblioteca, redes, catalogoLibros }`
     - `crearBiblio`: return `{ success: true, biblioteca }` with flash messages
     - `editarBiblio`: return `{ success: true, biblioteca }` with flash messages
     - `borrarBiblio`: return `{ success: true }` with flash messages
     - `queEs`, `requisitos`: return `{ title }` (or skip -- static content in React)
     - `librosPorBiblio`: return `{ biblioteca, libros, title, isGeneral: false, isBusqueda }`
  2. Include flash messages in response headers or body:
     - Use a helper: `res.json({ data, flash: { success: req.flash('success'), error: req.flash('error') } })`
  3. Handle authentication errors as JSON: `{ error: 'Unauthorized' }` with 401 status
  4. Handle validation errors: `{ error: 'Validation failed', details }` with 400 status
  5. Keep existing EJS route files intact during incremental migration
  6. Test each endpoint with `curl` or Postman
- **Verification & Testing:** All endpoints return valid JSON. Auth checks work. Validation errors returned properly. Flash messages included.

---

#### Task 5.2: Convert Libros Routes to JSON API

- **Target Files:** Modify `routes/api/libros.js`
- **Props & Data Interface:** All libro endpoints return JSON
- **Dependencies Required:** Existing middleware
- **Execution Checklist:**
  1. Convert each handler:
     - `index`: return `{ libros, title, isGeneral: true, isBusqueda }`
     - `buscarLibros`: return same structure with search results
     - `mostrarLibro`: return `{ biblioteca, libro, title }`
     - `nuevoLibroForm`: return `{ biblioteca }` (or skip)
     - `editarLibroForm`: return `{ libro, bibliotecaId }` (or skip)
     - `crearLibro`: return `{ success: true, libro }` with flash
     - `editarLibro`: return `{ success: true, libro }` with flash
     - `borrarLibro`: return `{ success: true }` with flash
  2. Handle errors as JSON responses
- **Verification & Testing:** All endpoints return valid JSON. CRUD operations work.

---

#### Task 5.3: Convert Reviews Routes to JSON API

- **Target Files:** Modify `routes/api/reviews.js`
- **Props & Data Interface:** Review: `{ review: { rating, body } }`
- **Dependencies Required:** Existing middleware
- **Execution Checklist:**
  1. Convert handlers:
     - `POST /api/bibliotecas/:id/reviews/`: return `{ success: true, review }` with flash
     - `DELETE /api/bibliotecas/:id/reviews/:reviewId`: return `{ success: true }` with flash
  2. Handle auth errors: must be logged in, must be review author
- **Verification & Testing:** Review creation and deletion work via API. Auth checks work.

---

#### Task 5.4: Convert Info Routes to JSON API

- **Target Files:** Modify `routes/api/info.js`
- **Props & Data Interface:** `{ title }` or static content
- **Dependencies Required:** None
- **Execution Checklist:**
  1. `GET /api/info/legislacion`: return `{ title: 'Legislacion...' }` (React has static content)
- **Verification & Testing:** Endpoint returns JSON.

---

#### Task 5.5: Handle Flash Messages in React

- **Target Files:** Modify API response format, `client/src/context/FlashContext.jsx`
- **Props & Data Interface:** API responses include `flash: { success: [], error: [] }`
- **Dependencies Required:** None
- **Execution Checklist:**
  1. Update all API endpoints to include flash messages in response body
  2. Update `client/src/api/client.js` to extract flash data from responses:
     ```js
     const data = await res.json();
     if (data.flash) {
       // Dispatch to FlashContext
     }
     return data;
     ```
  3. Ensure flash messages display in React after API calls (create, update, delete, login, etc.)
  4. Handle flash messages from GET requests (e.g., redirect with flash)
- **Verification & Testing:** Flash messages appear after all CRUD operations. Success and error messages display correctly.

---

#### Task 5.6: Handle Method Override Removal

- **Target Files:** All React components using `?_method=DELETE` or `?_method=PUT`
- **Props & Data Interface:** N/A
- **Dependencies Required:** None
- **Execution Checklist:**
  1. In React, use proper HTTP methods via `fetch`:
     - `PUT` for updates (no query param needed)
     - `DELETE` for deletions
  2. Remove `method-override` dependency from API routes (keep for EJS routes during migration)
  3. Test: all PUT and DELETE operations work without `?_method=` query parameter
- **Verification & Testing:** All CRUD operations work with proper HTTP methods. No regression in EJS routes.

---

#### Task 5.7: Clean Up EJS After Full Migration

- **Target Files:** `views/` directory, `index.js` (remove EJS config)
- **Props & Data Interface:** N/A
- **Dependencies Required:** N/A
- **Execution Checklist:**
  1. Verify ALL pages are working in React
  2. Remove EJS view engine configuration from `index.js`:
     ```js
     // Remove these lines:
     // app.engine('ejs', ejsMate);
     // app.set('view engine', 'ejs');
     // app.set('views', ...);
     ```
  3. Remove `ejs-mate` from `package.json`
  4. Remove `views/` directory
  5. Remove old `public/javascripts/` and `public/stylesheets/` (replaced by React/Tailwind)
  6. Remove `method-override` from `package.json` (no longer needed)
  7. Keep `helmet` but update CSP for Vite dev server origins
  8. Update `index.js` to only serve API routes and React build
- **Verification & Testing:** App runs with only React frontend. All pages work. No EJS remnants. Build succeeds.

---

## 3. Step-by-Step Execution Sequence

### Phase 1: Setup & Infrastructure (Tasks 1.1 - 1.7)
Complete all foundation work first. Each task builds on the previous.

### Phase 2: Global Layouts & Common Components (Tasks 2.1 - 2.3)
Build shared components before page-level work.

### Phase 3: Static / Low-Complexity Pages (Tasks 3.1 - 3.3)
Quick wins -- static content pages that need no API.

### Phase 4: Dynamic & Interactive Pages (Tasks 4.1 - 4.8)
Largest phase -- each page independently testable.

### Phase 5: Backend Route Decoupling (Tasks 5.1 - 5.7)
Convert all server routes to JSON API. Final cleanup.

---

## 4. Handling Flash Messages, CSRF, and Session Data

### Flash Messages
- **Current:** `connect-flash` middleware stores messages in session, rendered via `flash.ejs`
- **React approach:** API responses include flash data in body. React `FlashContext` renders dismissible alerts.
- **Implementation:** Each API endpoint adds flash before responding. Client extracts and displays.

### CSRF Tokens
- **Current:** NOT implemented in the app
- **Recommendation:** Add `csurf` or `csrf-csrf` middleware for API routes. Include token in React state, send with each mutation request.
- **Implementation:**
  1. Install `csurf` or `csrf-csrf`
  2. Add middleware to API routes
  3. Create `GET /api/csrf-token` endpoint
  4. React fetches token on mount, stores in state, includes in request headers

### Session Data
- **Current:** `express-session` with MongoDB store, `res.locals.currentUser` injected into all EJS views
- **React approach:** `GET /api/auth/current-user` endpoint returns session user. React stores in `AuthContext`.
- **Session cookie:** Keep `httpOnly: true`, add `sameSite: 'lax'` for security. Vite dev server proxy handles same-origin.

### Environment Variables (MAPTILER_API_KEY)
- **Current:** `<%- process.env.MAPTILER_API_KEY %>` injected into EJS inline scripts
- **React approach:** Use Vite env vars: `VITE_MAPTILER_API_KEY` in `.env` file, accessed as `import.meta.env.VITE_MAPTILER_API_KEY`
- **Implementation:** Add `VITE_MAPTILER_API_KEY=<value>` to `client/.env` file

---

## 5. Key CSS Class Mapping (Bootstrap to Tailwind)

| Bootstrap | Tailwind | Component |
|-----------|----------|-----------|
| `container` | `container mx-auto` | Layout |
| `mt-md-3` | `mt-0 md:mt-3` | Layout |
| `d-flex` | `flex` | Layout |
| `flex-column` | `flex-col` | Layout |
| `vh-100` | `h-screen` | Layout |
| `bg-primary` | `bg-blue-600` | Navbar, Footer |
| `navbar-dark` | (handled by bg + text color) | Navbar |
| `sticky-top` | `sticky top-0 z-50` | Navbar |
| `card` | `bg-white rounded-lg shadow-md` | Cards |
| `card-body` | `p-6` | Cards |
| `card-title` | `text-lg font-semibold` | Cards |
| `btn btn-primary` | `bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700` | Buttons |
| `btn-success` | `bg-green-600 text-white px-4 py-2 rounded` | Buttons |
| `btn-danger` | `bg-red-600 text-white px-4 py-2 rounded` | Buttons |
| `btn-info` | `bg-cyan-600 text-white px-4 py-2 rounded` | Buttons |
| `form-control` | `w-full px-3 py-2 border rounded` | Inputs |
| `form-label` | `block text-sm font-medium mb-1` | Forms |
| `mb-3` | `mb-4` | Spacing |
| `col-md-6` | `w-full md:w-1/2` | Grid |
| `offset-md-3` | `md:ml-[25%]` or `md:mx-auto` + max-width | Grid |
| `text-center` | `text-center` | Text |
| `text-muted` | `text-gray-500` | Text |
| `alert-success` | `bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded` | Alerts |
| `alert-danger` | `bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded` | Alerts |
| `carousel` | (use state + transitions) | Carousel |
| `list-group-item` | `border-b py-3` | Lists |
| `pagination` | `flex gap-1` | Pagination |
| `page-item.active` | `bg-blue-600 text-white rounded` | Pagination |
| `input-group` | `flex` | Input groups |
| `input-group-text` | `bg-gray-100 px-3 border border-r-0 rounded-l` | Input groups |
| `form-check-input` | `w-4 h-4` | Checkboxes |
| `img-fluid` | `max-w-full h-auto` | Images |
| `img-thumbnail` | `border rounded p-1` | Images |
| `validated-form` / `was-validated` | React Hook Form validation | Forms |
| `valid-feedback` | Conditional error display | Forms |

---

## 6. Complete Route Map

### React Routes (react-router-dom)

| Path | Component | Data Source |
|------|-----------|-------------|
| `/` | `Home` | None (static) |
| `/bibliotecas` | `BibliotecasIndex` | `GET /api/bibliotecas` |
| `/bibliotecas/nueva` | `NuevaBiblioteca` | None (form) |
| `/bibliotecas/que-es` | `QueEs` | None (static) |
| `/bibliotecas/requisitos` | `Requisitos` | None (static) |
| `/bibliotecas/:id` | `BiblioDetails` | `GET /api/bibliotecas/:id` |
| `/bibliotecas/:id/editar` | `EditarBiblioteca` | `GET /api/bibliotecas/:id` |
| `/bibliotecas/:id/libros` | `LibrosIndex` | `GET /api/bibliotecas/:id/libros` |
| `/bibliotecas/:id/libros/nuevo` | `NuevoLibro` | None (form) |
| `/bibliotecas/:id/libros/:libroId` | `LibroShow` | `GET /api/libros/:libroId` |
| `/bibliotecas/:id/libros/:libroId/editar` | `EditarLibro` | `GET /api/libros/:libroId` |
| `/libros` | `LibrosCatalogo` | `GET /api/libros` |
| `/libros/buscar` | `LibrosCatalogo` | `GET /api/libros/buscar` |
| `/libros/:id` | `LibroShow` | `GET /api/libros/:id` |
| `/login` | `Login` | None (form) |
| `/registro` | `Registro` | None (form) |
| `/contacto` | `Contacto` | None (form) |
| `/info/legislacion` | `Legislacion` | None (static) |
| `/verify/:token` | `VerifyEmail` | `GET /api/auth/verify/:token` |
| `*` | `NotFound` | None |

### API Endpoints

| Method | Path | Purpose |
|--------|------|---------|
| GET | `/api/auth/current-user` | Get logged-in user |
| POST | `/api/auth/login` | Login |
| POST | `/api/auth/register` | Register |
| GET | `/api/auth/logout` | Logout |
| GET | `/api/auth/verify/:token` | Verify email |
| GET | `/api/bibliotecas` | List/search bibliotecas |
| POST | `/api/bibliotecas` | Create biblioteca |
| GET | `/api/bibliotecas/:id` | Get single biblioteca |
| PUT | `/api/bibliotecas/:id` | Update biblioteca |
| DELETE | `/api/bibliotecas/:id` | Delete biblioteca |
| GET | `/api/bibliotecas/que-es` | Static info |
| GET | `/api/bibliotecas/requisitos` | Static info |
| GET | `/api/bibliotecas/:id/libros` | Books for biblioteca |
| POST | `/api/bibliotecas/:id/libros` | Create book |
| GET | `/api/bibliotecas/:id/libros/nuevo` | New book form data |
| GET | `/api/bibliotecas/:id/libros/:libroId/editar` | Edit book form data |
| GET | `/api/bibliotecas/:id/libros/:libroId` | Get single book |
| PUT | `/api/bibliotecas/:id/libros/:libroId` | Update book |
| DELETE | `/api/bibliotecas/:id/libros/:libroId` | Delete book |
| GET | `/api/libros` | General catalog |
| GET | `/api/libros/buscar` | Search books |
| GET | `/api/libros/:id` | Get single book |
| POST | `/api/bibliotecas/:id/reviews/` | Create review |
| DELETE | `/api/bibliotecas/:id/reviews/:reviewId` | Delete review |
| GET | `/api/info/legislacion` | Legislation info |
| POST | `/api/contacto` | Send contact email |

---

## 7. Dependencies Summary

### New npm packages (client):
- `vite`, `@vitejs/plugin-react`
- `react`, `react-dom`
- `react-router-dom`
- `react-hook-form`
- `@maptiler/sdk`
- `tailwindcss`, `postcss`, `autoprefixer`

### New npm packages (server - dev):
- `tailwindcss` (if PostCSS processing on server)

### Removed packages (after full migration):
- `ejs`, `ejs-mate`
- `method-override` (can keep for safety)

### Kept packages:
- `express`, `mongoose`, `passport`, `passport-local`, `passport-local-mongoose`
- `express-session`, `connect-mongo`, `connect-flash`
- `helmet`, `express-mongo-sanitize`
- `joi`, `sanitize-html`
- `multer`, `multer-storage-cloudinary`, `cloudinary`
- `@maptiler/client`, `nodemailer`, `dotenv`

---

## 8. File Creation Summary

### New files to create:

```
client/
  index.html
  package.json
  vite.config.js
  tailwind.config.js
  postcss.config.js
  .env                          # VITE_MAPTILER_API_KEY
  src/
    main.jsx
    App.jsx
    index.css
    api/
      client.js
      bibliotecas.js
      libros.js
      auth.js
      reviews.js
    context/
      AuthContext.jsx
      FlashContext.jsx
    hooks/
      useAuth.js
    components/
      layout/
        Layout.jsx
        Navbar.jsx
        Footer.jsx
        FlashMessages.jsx
      ui/
        Button.jsx
        Card.jsx
        Modal.jsx
        Input.jsx
        Select.jsx
        TextArea.jsx
        Alert.jsx
        StarRating.jsx
        Pagination.jsx
      maps/
        ClusterMap.jsx
        ShowPageMap.jsx
    pages/
      Home.jsx
      NotFound.jsx
      bibliotecas/
        BibliotecasIndex.jsx
        BiblioDetails.jsx
        NuevaBiblioteca.jsx
        EditarBiblioteca.jsx
        QueEs.jsx
        Requisitos.jsx
      libros/
        LibrosCatalogo.jsx
        LibroShow.jsx
        NuevoLibro.jsx
        EditarLibro.jsx
      usuarios/
        Login.jsx
        Registro.jsx
        EsperaVerificacion.jsx
        Contacto.jsx
      info/
        Legislacion.jsx
    styles/
      home.css
routes/
  api/
    bibliotecas.js
    libros.js
    usuarios.js
    reviews.js
    info.js
```

### Files to modify:
- `index.js` -- add React build serving, mount API routes
- `routes/bibliotecas.js` -- keep for EJS during migration
- `routes/libros.js` -- keep for EJS during migration
- `routes/usuarios.js` -- keep for EJS during migration
- `routes/reviews.js` -- keep for EJS during migration
- `routes/info.js` -- keep for EJS during migration
- `package.json` -- add new scripts, new dependencies

### Files to delete (after full migration):
- `views/` directory (all 22 EJS files)
- `public/javascripts/` (5 files)
- `public/stylesheets/` (5 files)
- Remove `ejs`, `ejs-mate`, `method-override` from dependencies
