----
applyTo: '**/*.js'
----

Scope: JavaScript files only. Enforce these rules when generating or reviewing JS code that interacts with Oracle Database MLE or in-database JavaScript.

Oracle MLE best practices (26ai updates)
- Use `MLE` features intentionally: prefer server-side JS for logic that benefits from proximity to data; avoid non-database logic in MLE.
- Enable restricted contexts when needed: use `PURE` execution for side-effect-free routines that must not access DB state.
- Prefer operator overloading for `OracleNumber`: use `+`, `-`, `*`, `/` with `OracleNumber` instead of `add()`/`sub()` methods for readability and performance, where supported.
- Leverage `FFI` for PL/SQL: when calling PL/SQL packages/functions from JS, use the Foreign Function Interface to treat them as JS objects and avoid brittle string calls.
- Use `fetchTypeHandler` in `mle-js-oracledb`: customize result-set type mapping (e.g., convert VARCHAR2 to JS types, handle numeric precision) close to query execution.
- Compile-time syntax checking: rely on DB compile-time checks for inline call specifications; additionally run a linter (ESLint) before deployment.
- DRCP compatibility: MLE now supports Database Resident Connection Pool on dedicated servers—ensure pool settings align with workload; do not hardcode connection properties.
- Privileges: `EXECUTE ON JAVASCRIPT` is no longer required for executing JS in your own schema; still request minimal additional privileges based on actual DB interactions.
- User-defined types: support collections/records/objects as parameters and results in in-database JS—define clear type contracts and validate inputs.
- Vectors: use `SparseVector` for VECTOR data type with IN/OUT/INOUT arguments; avoid dense representations when sparsity improves performance.

Coding guidance
- Isolation: separate MLE-bound JS modules from application JS; keep DB-specific code in dedicated files with clear boundaries.
- Error handling: normalize Oracle errors to structured JS errors; include context (module, procedure, parameters) without leaking sensitive data.
- Type mapping: explicitly document mappings between Oracle types and JS types; avoid implicit conversions that may lose precision (e.g., NUMERIC to float).
- Performance: batch operations and minimize round-trips; prefer set-based operations; avoid unnecessary JSON serialization in MLE.
- Security: validate inputs before passing to FFI/SQL; avoid dynamic SQL where possible; sanitize identifiers if dynamic usage is unavoidable.
- Testing: add unit tests for type handlers and FFI wrappers; include edge cases for NULLs, empty collections, malformed IDs.

Patterns to follow in this repo
- Keep JS utilities small and focused; colocate DB-related helpers near API route modules.
- When adding JS that interfaces with Oracle types, include brief JSDoc comments describing type contracts and execution context (PURE vs normal).
- Prefer configuration-driven connection settings compatible with DRCP; do not hardcode credentials or pool params.

Do not
- Do not mix frontend browser JS with server-side MLE code.
- Do not bypass linting or compile-time checks; always ensure JS passes ESLint and MLE syntax validation.
- Do not introduce dense vector operations when sparse vectors are expected.