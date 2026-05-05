1. Clone & Navigate
git clone https://github.com/YAdnan408/Marketplace.git
cd Marketplace

2. Backend Setup
cd backend
python -m venv venv
Activate the virtual environment:
Windows:
powershellvenv\Scripts\Activate.ps1
Mac/Linux:
source venv/bin/activate
Install dependencies:
pip install -r requirements.txt

3. Configure Environment
Create a .env file inside the backend/ folder:
envAPP_ENV=development
DATABASE_URL=postgresql+asyncpg://username:password@localhost:5432/mydatabase
SECRET_KEY=your_secret_key

4. Set Up the Database (Docker)
bashdocker run -d \
  --name postgres \
  -e POSTGRES_USER=username \
  -e POSTGRES_PASSWORD=password \
  -e POSTGRES_DB=mydatabase \
  -p 5432:5432 \
  postgres:16

5. Run Migrations
alembic upgrade head

6. Start the Backend Server
uvicorn app.main:app --reload
The API will be available at http://localhost:8000
Interactive docs at http://localhost:8000/docs

7. Frontend Setup
Open a new terminal:
cd frontend
npm install
npm run dev
The app will be available at http://localhost:5173
