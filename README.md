# 🧭 HR Training Tracking

An **HR Training Tracking System** built with **Angular 20** and **Node.js**, designed to help HR departments manage employee training programs — including courses, employees, and departments.

---

## 🚀 Development Setup

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/hr-training-tracking.git
cd hr-training-tracking
```

### 2. Install Dependencies

#### Frontend
```bash
npm install
```

#### Backend
Navigate to the backend folder (if applicable):
```bash
cd backend
npm install
```

---

## 🖥️ Running the Application

You’ll need to run **both the Angular frontend** and the **Node.js backend**.

### Start the Backend
From the backend directory (or project root if `server.js` is there):
```bash
node server.js
```
By default, the backend runs on [http://localhost:3000](http://localhost:3000).

### Start the Frontend
In a separate terminal:
```bash
ng serve
```
Then open your browser and go to [http://localhost:4200](http://localhost:4200/).

---

## 🏗️ Project Structure

| Directory | Description |
|------------|-------------|
| `src/app/components` | Angular UI components |
| `src/app/services` | API and data handling services |
| `src/app/models` | TypeScript interfaces and data models |
| `src/app/store` | (Optional) NgRx Signal Store state management |
| `backend/` | Node.js backend (API endpoints, database connections) |
| `server.js` | Main Node.js server file |
| `package.json` | Project configuration and dependencies |

---

## ⚙️ Building the Angular App

To create a production build:

```bash
ng build --configuration production
```

The compiled files will be located in the `dist/hr-training-tracking/` directory.  
You can configure your `server.js` to serve this folder for deployment.

---

## 🧪 Testing

### Unit Tests (Frontend)
```bash
ng test
```

### End-to-End Tests (Optional)
```bash
ng e2e
```

---

## 🧩 Features

- ✅ Employee, Position, and Department management  
- ✅ Course creation and enrollment tracking  
- ✅ **Flashcard Quiz System** - Interactive flashcards for testing knowledge with random question selection
- ✅ REST API backend with Node.js + Express  
- 🔄 Search and filtering functionality  
- 🧠 NgRx Signal Store for reactive state management  
- 💾 MySQL integration (planned / in progress)

---

## 🧰 Tech Stack

- **Frontend:** Angular 20, TypeScript, SCSS  
- **Backend:** Node.js, Express.js  
- **Database:** MySQL / Cloud SQL (planned)  
- **Build Tool:** Angular CLI  
- **Testing:** Jasmine, Karma  

---

## 🎴 Flashcard Quiz Feature

The application now includes an interactive flashcard quiz system! This feature allows users to test their knowledge with randomly selected questions.

**Key Features:**
- Random question selection from a pool of questions
- Beautiful flip animation to reveal answers
- Category-based organization
- Progress tracking
- Reset functionality

For detailed information about using and customizing the flashcard feature, see [FLASHCARD_README.md](./FLASHCARD_README.md).

---

## 📚 Additional Resources

- [Angular CLI Reference](https://angular.dev/tools/cli)  
- [Node.js Documentation](https://nodejs.org/en/docs)  
- [Express.js Guide](https://expressjs.com/)  
- [RxJS Overview](https://rxjs.dev/guide/overview)
