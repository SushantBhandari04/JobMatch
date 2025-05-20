# JobMatch

JobMatch is an AI-powered job matching platform that recommends jobs to users based on their profile, skills, and preferences. The platform leverages advanced AI embeddings and vector search to provide highly relevant job recommendations.

---

## 🚀 Setup Instructions

### Prerequisites

- Node.js (v18+ recommended)
- npm or yarn
- PostgreSQL (or your preferred database, if using Prisma)
- Pinecone account (for vector search)
- Cohere API key (for embeddings)

### 1. Clone the Repository

```sh
git clone https://github.com/SushantBhandari04/JobMatch.git
cd JobMatch
```

### 2. Environment Variables

Copy the example environment files and fill in your credentials:

```sh
cp be/.env.example be/.env
cp fe/.env.example fe/.env
```

**Backend (`be/.env`):**
```
DATABASE_URL=postgresql://user:password@localhost:5432/jobmatch
JWT_SECRET=your_jwt_secret
PINECONE_API_KEY=your_pinecone_api_key
PINECONE_INDEX_NAME=your_pinecone_index_name
COHERE_API_KEY=your_cohere_api_key
```

**Frontend (`fe/.env`):**
```
NEXT_PUBLIC_BACKEND_URL=http://localhost:3001
```

### 3. Install Dependencies

```sh
cd be
npm install
cd ../fe
npm install
```

### 4. Database Setup

```sh
cd ../be
npx prisma migrate dev --name init
npx prisma generate
```

### 5. Start the Backend

```sh
npm run dev
```

### 6. Start the Frontend

```sh
cd ../fe
npm run dev
```

---

## 🤖 AI Usage & Prompt Design

JobMatch leverages advanced AI techniques to provide highly relevant job recommendations by understanding both job postings and user profiles at a semantic level.

### Embeddings

- **Job Embeddings:** Each job posting is transformed into a high-dimensional vector using the Cohere API. The embedding captures the semantic meaning of the job, including its title, company, location, type (e.g., remote, hybrid, onsite), required experience, detailed description, responsibilities, requirements, and listed skills.
- **Profile Embeddings:** Similarly, user profiles are embedded using the same Cohere model. The profile embedding is generated from the user's stated title, location, years of experience, experience level, bio, skills, preferred job types, and remote work preferences.
- **Why Embeddings?**: By using embeddings, JobMatch can compare jobs and profiles based on meaning, not just keywords. This enables the platform to recommend jobs that are a good fit even if the user's profile and the job description use different terminology.

### Vector Search

- **Pinecone Integration:** All job embeddings are stored in Pinecone, a managed vector database. When a user requests job recommendations, their profile is embedded and Pinecone is queried for the most similar job vectors.
- **Similarity Matching:** Pinecone uses efficient nearest neighbor search algorithms to find jobs whose embeddings are closest to the user's profile embedding. This allows for fast, scalable, and accurate job matching even as the number of jobs grows.
- **Real-Time Recommendations:** Because embeddings and vector search are used, recommendations can be generated in real time as users update their profiles or as new jobs are added.

### Prompt Design

- **Structured Prompts:** To maximize the quality of embeddings, both job and profile data are formatted into structured prompts before being sent to the Cohere API. For example, a job prompt might look like:

  ```
  {title}
  Company: {company}
  Location: {location}
  Type: {type} ({remote/hybrid/onsite})
  Experience: {experience}
  Description: {description}
  Responsibilities: {comma-separated list}
  Requirements: {comma-separated list}
  Skills: {comma-separated list}
  ```

- **Consistency:** The same structure is used for both jobs and profiles, ensuring that the embeddings are comparable and that the semantic meaning is preserved.
- **Comprehensive Context:** By including all relevant fields (not just title or skills), the embedding captures a holistic view of the job or user, improving the quality of matches.

### Example Workflow

1. **Job Ingestion:** When a new job is posted, it is embedded using the structured prompt and stored in Pinecone.
2. **Profile Update:** When a user creates or updates their profile, it is embedded in the same way.
3. **Matching:** When the user requests recommendations, their profile embedding is sent to Pinecone, which returns the most similar job embeddings.
4. **Result Ranking:** The backend retrieves the corresponding job postings and presents them to the user, ranked by similarity.

### Benefits

- **Semantic Understanding:** Goes beyond keyword matching to understand the intent and context of both jobs and profiles.
- **Personalization:** Recommendations improve as users provide more detailed profiles.

---

## 📚 API Documentation

### Authentication

- `POST /signup` — Register a new user
- `POST /signin` — Login and receive JWT

### Profile

- `POST /profile/create` — Create or update user profile (requires JWT)
- `GET /profile` — Get current user's profile (requires JWT)

### Jobs

- `GET /jobs` — List all jobs (with optional filters)
- `POST /jobs/embed` — (Admin) Embed and store jobs in Pinecone

### Matching

- `GET /jobs/match` — Get job recommendations for the current user (requires JWT)

**All protected routes require the `Authorization` header with a valid JWT.**

---

## 🏗️ Code Architecture Overview

```
jobmatch/
├── be/                # Backend (Node.js, Express, Prisma, Pinecone, Cohere)
│   ├── src/
│   │   ├── index.ts           # Main Express app
│   │   ├── db.ts              # Prisma client
│   │   ├── pinecone.ts        # Pinecone client setup
│   │   ├── cohere.ts          # Cohere embedding logic
│   │   ├── embed-jobs.ts      # Job embedding and upsert logic
│   │   ├── middleware.ts      # Auth middleware
│   │   └── ...                # Other modules
│   ├── prisma/                # Prisma schema and migrations
│   └── ...
├── fe/                # Frontend (Next.js, React, shadcn/ui)
│   ├── app/                   # Next.js app directory
│   ├── components/            # Shared UI components
│   ├── contexts/              # React contexts (e.g., auth)
│   └── ...
└── README.md
```

- **Backend:** Handles authentication, profile management, job CRUD, embedding, and vector search.
- **Frontend:** Provides user interfaces for signup, profile creation, job browsing, and recommendations.

---

## ⚖️ Trade-offs & Assumptions

- **AI Embeddings:** Using Cohere for embeddings provides strong semantic matching but introduces external API latency and cost.
- **Vector DB:** Pinecone is used for scalable vector search; local development may be limited without a Pinecone account.
- **Authentication:** JWT-based authentication is simple and stateless but requires secure storage of secrets.
- **Profile/Job Schema:** The matching quality depends on the richness and accuracy of user profiles and job postings.
- **Error Handling:** Basic error handling is implemented; production deployments should add more robust logging and monitoring.
- **Frontend/Backend Split:** The project is split into separate frontend and backend folders for clarity and scalability.

---

## 📝 Assumptions

- Users will create detailed profiles to improve match quality.
- Jobs are embedded once and updated only when changed.
- The backend is trusted to securely handle API keys and secrets.
- The platform is intended for demonstration and prototyping; production hardening is recommended for real-world use.

---

## 📞 Support

For questions or contributions, open an issue or pull request on [GitHub](https://github.com/SushantBhandari04/JobMatch).

---