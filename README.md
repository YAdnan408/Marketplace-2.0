## Setup & Run

### Prerequisites
- Python 3.11+
- Node.js 18+
- Docker

---

### 1. Clone & Navigate

```bash
git clone https://github.com/YAdnan408/Marketplace.git
cd Marketplace
```

---

### 2. Backend Setup

```bash
cd backend
python -m venv venv
```

Activate the virtual environment:

**Windows:**
```powershell
venv\Scripts\Activate.ps1
```

**Mac/Linux:**
```bash
source venv/bin/activate
```

Install dependencies:
```bash
pip install -r requirements.txt
```

---

### 3. Configure Environment

Create a `.env` file inside the `backend/` folder:

```env
APP_ENV=development
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/mydatabase
SECRET_KEY=your_secret_key
```

---

### 4. Set Up the Database (Docker)

```bash
psql -U postgres -c "CREATE DATABASE marketplace_db;"
```

---

### 5. Run Migrations

```bash
alembic upgrade head
```

---

### 6. Start the Backend Server

```bash
uvicorn app.main:app --reload
```

The API will be available at `http://localhost:8000`  
Interactive docs at `http://localhost:8000/docs`

---

### 7. Frontend Setup

Open a new terminal:

```bash
cd frontend
npm install
npm run dev
```

The app will be available at `http://localhost:5173`
