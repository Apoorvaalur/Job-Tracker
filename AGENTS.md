# Development rules
- Keep all database queries, form normalization, enum values and application filtering in src/services/database.js so every view uses the same rules.
- Application writes use the SECURITY INVOKER save_application RPC to commit the row and status history atomically under owner-only RLS; never replace it with separate writes.
- Do not modify interview records while changing application status; interviews are independent records preserved until their parent application is deleted.
- This downloadable app uses the existing Vite JavaScript scaffold; it is separate from the preview application.
- Shared presentation is defined by semantic CSS tokens and layout classes in src/index.css; use the local Icon component for interface symbols without adding a UI dependency.

- Store interview timestamps as UTC instants converted from an explicitly named IANA time zone; reject ambiguous/nonexistent clock-change times to prevent silent scheduling errors.
- PWA support uses only a manifest and solid-color icons; do not add offline caching or cache authentication/private API responses.
