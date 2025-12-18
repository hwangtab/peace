# Error Handling Strategy

## Current Implementation

### 1. Error Boundaries

**Location**: `src/App.tsx`

```tsx
<ErrorBoundary FallbackComponent={ErrorFallback} onReset={() => window.location.reload()}>
  {/* App content */}
</ErrorBoundary>
```

**Purpose**: Catches React component errors and displays a user-friendly fallback UI.

---

### 2. Data Loading Errors

**Location**: `src/components/home/GallerySection.tsx`

**Strategy**: Silent fail with empty state
- Gallery images fail to load → Empty gallery displayed
- No console pollution in production
- TODO comment for future error tracking integration

**Example**:
```tsx
try {
  // Load images
} catch (error) {
  // Silent fail - images remain empty
  // TODO: Integrate Sentry
}
```

---

### 3. Image Loading Errors

**Location**: `src/components/press/PressPage.tsx`

**Strategy**: Fallback extension handling
```tsx
onError={(e) => {
  const img = e.target as HTMLImageElement;
  if (img.src.endsWith('.jpeg')) {
    img.src = img.src.replace('.jpeg', '.jpg');
  }
}}
```

---

## Image Loading Strategy

| Component | Loading Strategy | Rationale |
|-----------|-----------------|-----------|
| `HeroSection` | `loading="eager"` | Above-the-fold, critical content |
| `MusicianCard` | `loading="eager"` | Important content, small images |
| `GalleryImageItem` | `loading="lazy"` (conditional) | Below-the-fold, many images |
| `VideoCard` | `loading="lazy"` | Below-the-fold thumbnails |
| `PressPage` | `loading="lazy"` | Below-the-fold article images |

---

## Future Improvements

### Phase 1: Error Tracking Service
- **Tool**: Sentry or similar
- **Integration Points**:
  - `GallerySection` data loading
  - `AudioPlayer` playback errors
  - Global `window.onerror` handler

### Phase 2: User Feedback
- Toast notifications for non-critical errors
- Retry mechanisms for failed network requests

### Phase 3: Logging Levels
```typescript
enum LogLevel {
  ERROR = 'error',
  WARN = 'warn',
  INFO = 'info',
  DEBUG = 'debug'
}
```

---

## Development vs Production

**Development**:
- Console errors enabled for debugging
- Detailed error messages

**Production**:
- Silent failures for non-critical errors
- Error tracking to external service
- User-friendly error messages only
