# Phase 5: Backend Route Decoupling — Implementation Plan

## Overview
Fix auth gaps, add validation, wire flash messages, and clean up API routes for production readiness.

---

## Task 5.1: Create API-Compatible Auth Middleware

**File:** `middleware.js`

Create new middleware functions that return JSON (401/403) instead of redirects/renders:

### 5.1.1 `apiEstaLogueado` (API isLoggedIn)
```
- Check: req.isAuthenticated()
- If NOT: return res.status(401).json({ error: 'Tenés que estar logueado' })
- If YES: call next()
```

### 5.1.2 `apiVerificarEmail` (API verifyEmail)
```
- Check: req.user exists AND req.user.isVerified === true
- If NOT verified: return res.status(403).json({ error: 'Tu email no fue verificado. Revisa tu casilla de correo.' })
- If verified: call next()
```

### 5.1.3 `apiEsAutor` (API isAuthor)
```
- Find: Biblioteca.findById(req.params.id)
- If NOT found: return res.status(404).json({ error: 'Biblioteca no encontrada' })
- If NOT author: return res.status(403).json({ error: 'No tenés permiso para esto' })
- If author: attach biblioteca to req, call next()
```

### 5.1.4 `apiEsReviewAutor` (API isReviewAuthor)
```
- Find: Review.findById(req.params.reviewId)
- If NOT found: return res.status(404).json({ error: 'Review no encontrada' })
- If NOT author: return res.status(403).json({ error: 'No tenés permiso para esto' })
- If author: attach review to req, call next()
```

---

## Task 5.2: Apply Auth + Validation Middleware to API Routes

### Bibliotecas API (`routes/api/bibliotecas.js`)

| Route | Current | Add |
|-------|---------|-----|
| `GET /` | None | None (public) |
| `POST /` | `if (!req.user)` | `apiEstaLogueado`, `apiVerificarEmail`, `upload`, `validateBiblio` |
| `GET /:id` | None | None (public) |
| `PUT /:id` | `if (!req.user)` + `if (!autor.equals)` | `apiEstaLogueado`, `apiVerificarEmail`, `apiEsAutor`, `upload`, `validateBiblio` |
| `DELETE /:id` | `if (!req.user)` + `if (!autor.equals)` | `apiEstaLogueado`, `apiEsAutor` |
| `GET /:id/libros` | None | None (public) |

### Reviews API (`routes/api/reviews.js`)

| Route | Current | Add |
|-------|---------|-----|
| `POST /` | `if (!req.user)` | `apiEstaLogueado`, `apiVerificarEmail`, `validateReview` |
| `DELETE /:reviewId` | `if (!req.user)` + `if (!autor.equals)` | `apiEstaLogueado`, `apiEsReviewAutor` |

### Libros API (`routes/api/libros.js`)

| Route | Current | Add |
|-------|---------|-----|
| `GET /` | None | None (public) |
| `GET /:id` | None | None (public) |
| `POST /bibliotecas/:biblioId` | `if (!req.user)` + `if (!autor.equals)` | `apiEstaLogueado`, `apiVerificarEmail`, `apiEsAutor`, `validateLibro` |
| `PUT /bibliotecas/:biblioId/:libroId` | `if (!req.user)` + `if (!autor.equals)` | `apiEstaLogueado`, `apiVerificarEmail`, `apiEsAutor`, `validateLibro` |
| `DELETE /bibliotecas/:biblioId/:libroId` | `if (!req.user)` + `if (!autor.equals)` | `apiEstaLogueado`, `apiVerificarEmail`, `apiEsAutor` |

---

## Task 5.3: Wire Flash Messages in React Client

**File:** `client/src/api/client.js`

Modify the `request()` function to auto-extract flash messages from API responses:

```js
// After parsing JSON response:
if (data.flash) {
  if (data.flash.success?.length) {
    // Import and call showSuccess — but we can't import context here
    // Alternative: return flash data and let caller handle it
    // OR: use a global event emitter
  }
}
```

**Approach:** Since `client.js` can't import React context directly, we'll use a **callback pattern**:
1. `client.js` exports a `setFlashHandlers({ showSuccess, showError })` function
2. `FlashProvider` calls `setFlashHandlers()` on mount
3. `request()` auto-extracts flash and calls the handlers

This keeps flash handling centralized without coupling `client.js` to React.

---

## Task 5.4: Implement Info API Routes

**File:** `routes/api/info.js`

Convert from stub to real data:

```js
router.get('/legislacion', (req, res) => {
  res.json({
    title: 'Legislación',
    content: {
      // Port the actual content from views/info/legislacion.ejs
      // OR return minimal data since React has the static content
    }
  });
});
```

Since React already has the static content in `Legislacion.jsx`, the API just needs to confirm the route exists. Minimal stub is acceptable.

---

## Task 5.5: Add Missing Libros Search Route

**File:** `routes/api/libros.js`

Add `GET /buscar` route that the client expects:

```js
router.get('/buscar', catchAsync(async (req, res) => {
  const { titulo, autor, genero } = req.query;
  let query = {};
  if (titulo) query.titulo = { $regex: titulo, $options: 'i' };
  if (autor) query.autor = { $regex: autor, $options: 'i' };
  if (genero) query.genero = { $regex: genero, $options: 'i' };
  const libros = await Libro.find(query);
  res.json({ libros });
}));
```

**Note:** Must be defined BEFORE `/:id` route to avoid route conflict.

---

## Task 5.6: Clean Up Middleware in Existing API Routes

Remove inline auth checks from API route handlers (replace with middleware):

**Before (inline):**
```js
router.post('/', catchAsync(async (req, res) => {
  if (!req.user) return res.status(401).json({ error: '...' });
  // ... logic
}));
```

**After (middleware):**
```js
router.post('/', apiEstaLogueado, apiVerificarEmail, upload, validateBiblio, catchAsync(async (req, res) => {
  // ... logic (auth already verified by middleware)
}));
```

---

## Execution Order

| Step | Task | Files Modified |
|------|------|----------------|
| 1 | Create API auth middleware | `middleware.js` |
| 2 | Wire flash messages in client | `client/src/api/client.js`, `client/src/context/FlashContext.jsx` |
| 3 | Apply middleware to bibliotecas API | `routes/api/bibliotecas.js` |
| 4 | Apply middleware to reviews API | `routes/api/reviews.js` |
| 5 | Apply middleware to libros API | `routes/api/libros.js` |
| 6 | Add libros search route | `routes/api/libros.js` |
| 7 | Implement info API | `routes/api/info.js` |
| 8 | Build and test | `npm run build:client` |

---

## Verification Checklist

- [ ] Unverified user gets 403 when trying to create biblioteca/review/libro
- [ ] Unauthenticated user gets 401 when trying to create/edit/delete
- [ ] Non-author gets 403 when trying to edit/delete someone else's biblioteca
- [ ] Validated data passes, invalid data returns 400 with error details
- [ ] Flash messages appear in React after create/update/delete/login/register
- [ ] `GET /api/libros/buscar` returns search results
- [ ] `GET /api/info/legislacion` returns valid response
- [ ] All existing functionality still works (no regression)
