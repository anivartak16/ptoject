# Canonical project location

`do/` is the complete, runnable KrishiLink application and the only project
directory that should be used for further development or delivery.

The sibling `krishilink-frontend/` folder is an earlier standalone UI prototype.
It uses simulated API responses and is retained only as a visual/reference
artifact. Its completed product workflows have been superseded here by the
React client in `frontend/` and the Express/MongoDB API in `backend/`.

## Run the canonical app

1. Copy `backend/.env.example` to `backend/.env` and set a private MongoDB URI
   and JWT secret. Copy `frontend/.env.example` to `frontend/.env` if the API
   is not running on the default URL.
2. Run `npm install`, `npm --prefix backend install`, and
   `npm --prefix frontend install`.
3. Run `npm run seed`, then `npm run dev`.

The `frontend` build has been verified with `npm --prefix frontend run build`.
