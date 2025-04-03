# Project Documentation: Full-Stack Web Application

## 🌐 Tech Stack Overview

**Backend:**
- **Django** (Python web framework)
- **Django REST Framework** (API building)
- **PostgreSQL (Supabase)** (Database)

**Frontend:**
- **React** (UI library)
- **Tailwind CSS** (UI components)
- **Axios** (API calls)

**DevOps:**
- **Docker** (Containerization)
- **Oracle Cloud VM** (Deployment)


## 🧩 Key Components

### Backend Components

1. **Item Model**
   - Defines database structure (name, category, description)
   - Includes timestamp fields

2. **API Endpoints**
   - `GET /api/items/` - List all items (with filtering)
   - `POST /api/items/` - Create new item
   - `GET/PUT/DELETE /api/items/<id>/` - Single item operations

3. **Filtering System**
   - Search by name/description
   - Filter by category
   - Uses DRF's built-in filters

### Frontend Components

1. **Landing Page**
   - Displays data table with auto-sorting (recently added)
   - Responsive design (works on mobile)

2. **CRUD Interface**
   - Modal forms for create/edit
   - Delete confirmation dialogs
   - Real-time data refresh

3. **Additional Features**
   -   Category bucketing
   -  Filtering items based on name or category



## 🛠️ Development Setup

1. **Backend:**
   ```bash
   cd backend
   pip install -r requirements.txt
   python manage.py runserver
  
 2.  **Frontend:**
    
	   ```bash    
	    cd frontend
	    npm install
	    npm start
	 ```

## 💡 Why This Architecture?

-   **Separation of Concerns:** Clean split between frontend/backend
    
-   **Scalability:** Easy to add new features
    
-   **Maintainability:** Organized code structure
   
    

> Pro Tip: The proxy setup in React's `package.json` avoids CORS issues during development.

