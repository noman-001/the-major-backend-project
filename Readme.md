# Video Streaming & Social Platform — Backend API

A complete, production-ready RESTful backend for a YouTube-style video streaming and creator platform built with Node.js, Express, and MongoDB. Designed around modular MVC architecture, multi-stage MongoDB aggregation pipelines, stateless JWT authentication with `httpOnly` cookies, and cloud media streaming via Cloudinary.

---

## Tech Stack
- **eraser models link :** [Model Link](https://app.eraser.io/workspace/YtPqZ1VogxGy1jzIDkzj)

- **Runtime & Framework:** Node.js, Express.js
- **Database & ODM:** MongoDB, Mongoose (with Aggregation Framework)
- **Authentication & Security:** JSON Web Tokens (`accessToken` & `refreshToken`), `bcrypt`, `cookie-parser`, CORS
- **Media Storage & Upload:** Multer (local disk staging), Cloudinary SDK
- **Code Quality & Tooling:** Prettier, Nodemon, `dotenv`

---

## Key Features & Architecture

- **Authentication & User Management:** User registration with avatar/cover image uploads, login/logout, token rotation via refresh tokens, password updates, watch history tracking, and channel profile aggregation (subscriber counts and subscription status).
- **Video Publishing & Feed:** Video and thumbnail uploads to Cloudinary, dynamic feed search with regex filtering and sorting, atomic view-count increments (`$inc`), publish/unpublish privacy toggles, and creator ownership guards.
- **Social Engagement:**
  - **Subscriptions:** Toggle channel subscriptions and fetch subscriber/subscribed channel lists.
  - **Likes:** Polymorphic like toggling across videos, comments, and community tweets, plus liked-videos history.
  - **Comments & Tweets:** Full CRUD operations with owner-only edit/delete authorization.
- **Playlists:** Create and manage playlists, add/remove videos atomically using `$addToSet` and `$pull`, and populate full video/creator metadata.
- **Creator Studio Dashboard:** Real-time channel analytics aggregating total videos, total views, total subscribers, and total likes across all channel uploads.
- **Standardized Error & Response Handling:** Custom `ApiError`, `ApiResponse`, and `asyncHandler` utilities for consistent HTTP status codes and JSON payloads across all endpoints.

---

## Project Structure

```text
src/
├── controllers/      # Route handlers and business logic
├── db/               # MongoDB connection setup
├── middlewares/      # JWT verification & Multer upload configs
├── models/           # Mongoose schemas (User, Video, Subscription, Playlist, Comment, Like, Tweet)
├── routes/           # Modular Express routers
├── utils/            # ApiError, ApiResponse, asyncHandler, Cloudinary uploader
├── app.js            # Express app configuration & route mounting
├── constants.js      # Database name and app constants
└── index.js          # Server entry point