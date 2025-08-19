# Local-Market-API
A Backend for a Small Online Marketplace

## Base URL

- Local: `http://localhost:<PORT>` (default `PORT` from `.env`, server mounts API under `/api`)

## Authentication

All protected routes require an `Authorization` header with a Bearer token:

`Authorization: Bearer <JWT>`

JWT payload must include `id` of the authenticated user.

---

## Routes

### Auth (`/api/auth`)

- POST `/register`
  - Create a new user account.
  - Body: `{ name, email, password }`
  - Public

- POST `/login`
  - Authenticate a user and return a JWT.
  - Body: `{ email, password }`
  - Public

### Products (`/api/products`)

- GET `/allProducts`
  - Fetch all products.
  - Public

- GET `/search?query=<q>&limit=<n>`
  - Semantic/text search for products.
  - Uses MongoDB text index + AI-expanded terms.
  - Query: `query` (required), `limit` (optional, default 10)
  - Public

- GET `/getByID/:id`
  - Fetch a single product by its id.
  - Public

- POST `/createProduct`
  - Create a product.
  - Headers: `Authorization: Bearer <JWT>`
  - Role: `Seller`
  - Upload: single file field named `file` (JPEG/PNG/WEBP, <= 5MB)
  - Body: `{ name, description, price, category, tags? }`
  - Notes: Returns immediately; image upload and AI keyword generation continue in background. Product fields `imageStatus`/`keywordStatus` reflect progress.

- DELETE `/deleteProduct/:id`
  - Delete a product owned by the authenticated seller.
  - Headers: `Authorization: Bearer <JWT>`
  - Role: `Seller`

- PATCH `/updateProduct/:id`
  - Update a product owned by the authenticated seller.
  - Headers: `Authorization: Bearer <JWT>`
  - Role: `Seller`
  - Optional upload: single file field `file`

### Cart (`/api/cart`)

All cart routes require authentication: `Authorization: Bearer <JWT>`

- POST `/add`
  - Add a product to the cart or increase quantity if it already exists.
  - Body: `{ productId, quantity? }` (default `quantity = 1`)

- GET `/`
  - Get the authenticated user's cart with populated product details and totals.

- GET `/summary`
  - Get a lightweight summary of the cart: item count and total.

- PATCH `/update/:productId`
  - Set a new quantity for a specific product in the cart.
  - Body: `{ quantity }` (must be >= 1)

- DELETE `/remove/:productId`
  - Remove a product from the cart.

- DELETE `/clear`
  - Remove all items from the cart.

---

## Models Overview

- `User`
  - Standard auth fields. JWT encodes `{ id: user._id }`.

- `Product`
  - Fields: `name`, `description`, `price`, `category`, `image { url, public_id }`, `seller`, `tags[]`, `searchKeywords[]`
  - Text index on `name`, `description`, `category`, `tags`, `searchKeywords`.

- `Cart`
  - `user` reference and `items[]` of `{ product, quantity }`.

---

## File Uploads

- Uses `multer` in-memory storage; upload field name: `file`.
- Images are uploaded to Cloudinary in background after product creation.

---

## Environment

Required variables in `.env`:

- `PORT`
- `MONGO_URI`
- `JWT_SECRET`
- `CLOUDINARY_URL` or `{ CLOUDINARY_CLOUD_NAME, CLOUDINARY_API_KEY, CLOUDINARY_API_SECRET }`
- `GOOGLE_API_KEY` (for AI keyword generation)

---

## Development

- Install dependencies: `npm install`
- Run dev server: `npm run dev`
