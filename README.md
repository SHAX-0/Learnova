# Learnova — Learning Management System (Backend)

Learnova is a backend system for managing online courses and training activities. It provides RESTful APIs for user authentication, course and category management, lessons, enrollments, reviews & ratings, and quizzes.

Built as a graduation backend project for the **ITI Node.js Track**.

## Team Members

| # | Name |
|---|------|
| 1 | Mohammed Wael Ali Badr |
| 2 | Ahmed Mahmoud Mohamed |
| 3 | Asmaa Yasser Radwan |
| 4 | Esraa Yasser Radwan |
| 5 | Engy Abdelhamid Rakha |
| 6 | Shahd Mohamed Fawzy |

## Tech Stack

| Category | Technology |
|---|---|
| Backend | Node.js |
| Framework | Express.js |
| Database | MongoDB |
| ODM | Mongoose |
| Authentication | JWT |
| Password Hashing | bcrypt |
| Validation | express-validator |
| Environment Config | dotenv |
| API Testing | Postman |

## Features

- **Authentication & Users**: registration, login, JWT auth, role-based authorization (Student / Instructor / Admin), profile management.
- **Categories & Courses**: full CRUD, search, filtering, and pagination.
- **Lessons**: CRUD for course lessons, with access control (free lessons are public, other lessons require enrollment or course ownership).
- **Enrollments**: students can enroll in courses, duplicate enrollment is prevented, students can view their enrolled courses.
- **Reviews & Ratings**: enrolled students can review and rate courses (1–5); average rating is calculated automatically.
- **Quizzes**: instructors can create quizzes with multiple-choice questions; enrolled students can take a quiz once and get a score; results are viewable by the student or an admin.

> **Note:** Course material file uploads (PDF/images via Amazon S3) are not implemented yet and are planned as a future addition.

## Project Structure

```
src/
├── app.js                 # Express app setup and route mounting
├── config/                 # Database connection config
├── controllers/             # Request handling & business logic
├── middlewares/             # Auth, validation, error handling
├── models/                 # Mongoose schemas
└── routes/                 # Route definitions
server.js                   # Entry point
```

## Getting Started

### Prerequisites
- Node.js (v18+ recommended)
- MongoDB (local instance or MongoDB Atlas)

### Installation

1. Clone the repository
   ```bash
   git clone <repository-url>
   cd Learnova
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create a `.env` file in the project root based on `.env.example`:
   ```
   PORT=5000
   JWT_SECRET=your_jwt_secret_here
   MONGO_URI=your_mongodb_connection_string
   ```

4. Run the server
   ```bash
   npm run dev     # development, with nodemon
   npm start       # production
   ```

The API will be available at `http://localhost:5000`.

## API Endpoints

### Auth — `/api/auth`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/register` | Register a new user | Public |
| POST | `/login` | Log in a user | Public |

### Users — `/api/users`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| GET | `/:id` | Get a user's profile | Owner or Admin |
| PUT | `/:id` | Update a user's profile | Owner or Admin |

### Categories — `/api/categories`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Create a category | Admin |
| GET | `/` | Get all categories | Public |
| PUT | `/:id` | Update a category | Admin |
| DELETE | `/:id` | Delete a category | Admin |

### Courses — `/api/courses`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Create a course | Instructor |
| GET | `/` | Get all courses (search, filter, pagination) | Public |
| GET | `/:id` | Get course details | Public |
| PUT | `/:id` | Update a course | Owner Instructor / Admin |
| DELETE | `/:id` | Delete a course | Owner Instructor / Admin |

### Lessons — `/api/courses/:courseId/lessons`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Add a lesson to a course | Owner Instructor |
| GET | `/` | Get course lessons (content hidden unless free/enrolled/owner) | Logged in |
| PUT | `/:lessonId` | Update a lesson | Owner Instructor |
| DELETE | `/:lessonId` | Delete a lesson | Owner Instructor |

### Enrollments — `/api/courses/:courseId/enroll` & `/api/enrollments`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/api/courses/:courseId/enroll` | Enroll in a course | Student |
| GET | `/api/enrollments/my-enrollments` | Get the current student's enrolled courses | Student |

### Reviews — `/api/reviews`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Add a review + rating | Enrolled Student |
| GET | `/:courseId` | Get reviews for a course + average rating | Public |
| PUT | `/:id` | Update a review | Review owner |
| DELETE | `/:id` | Delete a review | Review owner |

### Quizzes — `/api/quizzes`
| Method | Endpoint | Description | Access |
|---|---|---|---|
| POST | `/` | Create a quiz with questions | Owner Instructor |
| GET | `/:courseId` | Get the quiz for a course (correct answers hidden from students) | Owner Instructor or Enrolled Student |
| POST | `/:id/submit` | Submit quiz answers | Enrolled Student |
| GET | `/results/:userId` | Get a student's quiz results | Self or Admin |

## Authentication

Protected routes require a JWT sent as a Bearer token:

```
Authorization: Bearer <token>
```

Obtain a token via `POST /api/auth/login`.

## Roles

- **Student**: browse/enroll in courses, take quizzes, write reviews.
- **Instructor**: manage their own courses, lessons, and quizzes.
- **Admin**: manage categories and users.
