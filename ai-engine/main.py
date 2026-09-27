# ============================================================
# LOKSETU AI BACKEND
# FastAPI + MongoDB + Gemini + JWT
# ============================================================

from fastapi import (
    FastAPI,
    HTTPException,
    UploadFile,
    File,
    Form,
    Depends,
    Query
)

from fastapi.middleware.cors import CORSMiddleware
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from pydantic import BaseModel, EmailStr

from pymongo import MongoClient, ASCENDING, DESCENDING
from bson import ObjectId

from datetime import datetime, timedelta

from google import genai

from dotenv import load_dotenv

import os
import shutil
import json
import hashlib
import secrets
import jwt


# ============================================================
# LOAD .ENV
# ============================================================

load_dotenv()


# ============================================================
# FASTAPI APP
# ============================================================

app = FastAPI(
    title="LokSetu AI Backend",
    description="Civic service platform backend for Citizens, Workers and Admins",
    version="5.0.0"
)


# ============================================================
# CORS
# ============================================================

app.add_middleware(
    CORSMiddleware,

    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",

        "http://localhost:5174",
        "http://127.0.0.1:5174",
    ],

    allow_credentials=True,

    allow_methods=["*"],

    allow_headers=["*"],
)


# ============================================================
# MONGODB
# ============================================================

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:

    raise RuntimeError(
        "MONGODB_URI environment variable is not set."
    )


client = MongoClient(
    MONGODB_URI,
    serverSelectionTimeoutMS=10000
)

db = client["loksetu"]


# Collections

incidents_collection = db["incidents"]

# New complaint collection
complaints_collection = db["complaints"]

users_collection = db["users"]

departments_collection = db["departments"]

notifications_collection = db["notifications"]

activity_collection = db["complaint_activity"]

updates_collection = db["updates"]

refresh_tokens_collection = db["refresh_tokens"]


# ============================================================
# DATABASE INDEXES
# ============================================================

try:

    users_collection.create_index(
        [("email", ASCENDING)],
        unique=True
    )

    users_collection.create_index(
        [("phone", ASCENDING)]
    )

    complaints_collection.create_index(
        [("complaint_id", ASCENDING)],
        unique=True
    )

    complaints_collection.create_index(
        [("citizen_id", ASCENDING)]
    )

    complaints_collection.create_index(
        [("assigned_worker_id", ASCENDING)]
    )

    complaints_collection.create_index(
        [("department_id", ASCENDING)]
    )

    complaints_collection.create_index(
        [("status", ASCENDING)]
    )

    complaints_collection.create_index(
        [("created_at", DESCENDING)]
    )

    notifications_collection.create_index(
        [("user_id", ASCENDING)]
    )

    activity_collection.create_index(
        [("complaint_id", ASCENDING)]
    )

    print("MongoDB indexes ready.")

except Exception as e:

    print(
        "Index creation warning:",
        repr(e)
    )


# ============================================================
# AUTHENTICATION SETTINGS
# ============================================================

JWT_SECRET_KEY = os.getenv("JWT_SECRET_KEY")

if not JWT_SECRET_KEY:

    raise RuntimeError(
        "JWT_SECRET_KEY environment variable is not set."
    )


JWT_ALGORITHM = "HS256"

ACCESS_TOKEN_EXPIRE_MINUTES = int(
    os.getenv(
        "ACCESS_TOKEN_EXPIRE_MINUTES",
        "1440"
    )
)

REFRESH_TOKEN_EXPIRE_DAYS = int(
    os.getenv(
        "REFRESH_TOKEN_EXPIRE_DAYS",
        "7"
    )
)


security = HTTPBearer()


# ============================================================
# GEMINI
# ============================================================

GEMINI_API_KEY = os.getenv(
    "GEMINI_API_KEY"
)

gemini_client = None


if GEMINI_API_KEY:

    try:

        gemini_client = genai.Client(
            api_key=GEMINI_API_KEY
        )

    except Exception as e:

        print(
            "Gemini initialization error:",
            repr(e)
        )


# ============================================================
# UPLOADS
# ============================================================

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# ============================================================
# MODELS
# ============================================================

class Complaint(BaseModel):

    description: str

    location: str = "Unknown"


class StatusUpdate(BaseModel):

    status: str


class UserRegister(BaseModel):

    name: str

    email: EmailStr

    password: str

    phone: str | None = None

    ward: str | None = None


class UserLogin(BaseModel):

    email: EmailStr

    password: str


class ComplaintCreate(BaseModel):

    title: str

    description: str

    category: str = "Other"

    location: dict

    priority: str = "medium"


class WorkerNote(BaseModel):

    note: str


class AssignComplaint(BaseModel):

    department_id: str | None = None

    worker_id: str | None = None


class StatusChange(BaseModel):

    status: str

    note: str | None = None


class DepartmentCreate(BaseModel):

    name: str

    code: str

    description: str = ""


class UpdateCreate(BaseModel):

    title: str

    description: str

    category: str = "General"

    ward: str | None = None

    status: str = "draft"


# ============================================================
# PASSWORD HASHING
# ============================================================

def hash_password(password: str) -> str:

    salt = secrets.token_bytes(16)

    password_hash = hashlib.pbkdf2_hmac(
        "sha256",
        password.encode("utf-8"),
        salt,
        310000
    )

    return (
        salt.hex()
        + ":"
        + password_hash.hex()
    )


def verify_password(
    password: str,
    stored_hash: str
) -> bool:

    try:

        salt_hex, hash_hex = stored_hash.split(":")

        salt = bytes.fromhex(
            salt_hex
        )

        expected_hash = bytes.fromhex(
            hash_hex
        )

        actual_hash = hashlib.pbkdf2_hmac(
            "sha256",
            password.encode("utf-8"),
            salt,
            310000
        )

        return secrets.compare_digest(
            actual_hash,
            expected_hash
        )

    except Exception:

        return False


# ============================================================
# JWT
# ============================================================

def create_access_token(
    user_id: str,
    email: str,
    role: str
):

    expire = datetime.utcnow() + timedelta(
        minutes=ACCESS_TOKEN_EXPIRE_MINUTES
    )

    payload = {

        "sub": user_id,

        "email": email,

        "role": role,

        "exp": expire

    }

    return jwt.encode(
        payload,
        JWT_SECRET_KEY,
        algorithm=JWT_ALGORITHM
    )


def create_refresh_token(
    user_id: str
):

    token = secrets.token_urlsafe(64)

    expires_at = (
        datetime.utcnow()
        + timedelta(
            days=REFRESH_TOKEN_EXPIRE_DAYS
        )
    )

    refresh_tokens_collection.insert_one({

        "token": token,

        "user_id": user_id,

        "expires_at": expires_at,

        "created_at":
            datetime.utcnow()

    })

    return token


# ============================================================
# AUTHENTICATED USER
# ============================================================

def get_current_user(
    credentials: HTTPAuthorizationCredentials =
        Depends(security)
):

    token = credentials.credentials

    try:

        payload = jwt.decode(
            token,
            JWT_SECRET_KEY,
            algorithms=[JWT_ALGORITHM]
        )

        user_id = payload.get(
            "sub"
        )

        email = payload.get(
            "email"
        )

        role = payload.get(
            "role"
        )

        if not user_id:

            raise HTTPException(
                status_code=401,
                detail="Invalid authentication token"
            )

        # Get latest user information
        if ObjectId.is_valid(user_id):

            user = users_collection.find_one(
                {
                    "_id":
                        ObjectId(user_id)
                }
            )

        else:

            user = None

        if not user:

            raise HTTPException(
                status_code=401,
                detail="User no longer exists"
            )

        if user.get(
            "is_active",
            True
        ) is False:

            raise HTTPException(
                status_code=403,
                detail="User account is inactive"
            )

        return {

            "user_id":
                str(user["_id"]),

            "email":
                user.get(
                    "email",
                    email
                ),

            "role":
                user.get(
                    "role",
                    role
                ),

            "name":
                user.get(
                    "name",
                    ""
                ),

            "user":
                user

        }

    except jwt.ExpiredSignatureError:

        raise HTTPException(
            status_code=401,
            detail="Authentication token has expired"
        )

    except jwt.InvalidTokenError:

        raise HTTPException(
            status_code=401,
            detail="Invalid authentication token"
        )


# ============================================================
# ROLE HELPERS
# ============================================================

def require_admin(
    current_user=Depends(
        get_current_user
    )
):

    if current_user["role"] != "admin":

        raise HTTPException(
            status_code=403,
            detail="Admin access required"
        )

    return current_user


def require_worker(
    current_user=Depends(
        get_current_user
    )
):

    if current_user["role"] != "worker":

        raise HTTPException(
            status_code=403,
            detail="Worker access required"
        )

    return current_user


def require_citizen(
    current_user=Depends(
        get_current_user
    )
):

    # "user" is supported because
    # your existing database uses role=user.

    if current_user["role"] not in [
        "citizen",
        "user"
    ]:

        raise HTTPException(
            status_code=403,
            detail="Citizen access required"
        )

    return current_user


# Backward compatibility
def require_user(
    current_user=Depends(
        get_current_user
    )
):

    if current_user["role"] not in [
        "user",
        "citizen"
    ]:

        raise HTTPException(
            status_code=403,
            detail="User access required"
        )

    return current_user


# ============================================================
# INITIAL ADMIN
# ============================================================

ADMIN_EMAIL = os.getenv(
    "ADMIN_EMAIL"
)

ADMIN_PASSWORD = os.getenv(
    "ADMIN_PASSWORD"
)


if ADMIN_EMAIL and ADMIN_PASSWORD:

    normalized_admin_email = (
        ADMIN_EMAIL.strip().lower()
    )

    existing_admin = users_collection.find_one(
        {
            "email":
                normalized_admin_email,

            "role":
                "admin"
        }
    )

    if not existing_admin:

        users_collection.insert_one({

            "name":
                "LokSetu Admin",

            "email":
                normalized_admin_email,

            "password_hash":
                hash_password(
                    ADMIN_PASSWORD
                ),

            "role":
                "admin",

            "is_active":
                True,

            "created_at":
                datetime.utcnow()

        })

        print(
            "Initial LokSetu admin created:",
            normalized_admin_email
        )


# ============================================================
# HOME
# ============================================================

@app.get("/")
def home():

    return {

        "success":
            True,

        "project":
            "LokSetu",

        "module":
            "AI Incident Engine",

        "status":
            "running",

        "database":
            "MongoDB Atlas",

        "authentication":
            "JWT",

        "ai_engine":
            "Gemini"
            if gemini_client
            else
            "Keyword Fallback"

    }


# ============================================================
# HEALTH
# ============================================================

@app.get("/health")
def health():

    try:

        client.admin.command(
            "ping"
        )

        database_status = "connected"

    except Exception:

        database_status = "disconnected"

    return {

        "success":
            True,

        "backend":
            "online",

        "database":
            database_status,

        "ai":
            "Gemini"
            if gemini_client
            else
            "Keyword Fallback"

    }


# ============================================================
# REGISTER
# ============================================================

@app.post("/auth/register")
def register_user(
    user: UserRegister
):

    email = (
        user.email
        .strip()
        .lower()
    )

    existing_user = users_collection.find_one(
        {
            "email":
                email
        }
    )

    if existing_user:

        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )

    if len(user.password) < 6:

        raise HTTPException(
            status_code=400,
            detail="Password must be at least 6 characters long"
        )

    new_user = {

        "name":
            user.name.strip(),

        "email":
            email,

        "phone":
            user.phone,

        "password_hash":
            hash_password(
                user.password
            ),

        # Keep citizen as the new
        # standard role.
        "role":
            "citizen",

        "department_id":
            None,

        "worker_id":
            None,

        "ward":
            user.ward,

        "is_active":
            True,

        "created_at":
            datetime.utcnow()

    }

    result = users_collection.insert_one(
        new_user
    )

    return {

        "success":
            True,

        "message":
            "User registered successfully",

        "user": {

            "id":
                str(result.inserted_id),

            "name":
                new_user["name"],

            "email":
                new_user["email"],

            "role":
                new_user["role"]

        }

    }


# ============================================================
# LOGIN CORE
# ============================================================

def login_user(
    login: UserLogin,
    allowed_roles=None
):

    email = (
        login.email
        .strip()
        .lower()
    )

    query = {

        "email":
            email

    }

    if allowed_roles:

        query["role"] = {
            "$in":
                allowed_roles
        }

    user = users_collection.find_one(
        query
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    if user.get(
        "is_active",
        True
    ) is False:

        raise HTTPException(
            status_code=403,
            detail="User account is inactive"
        )

    if not verify_password(
        login.password,
        user["password_hash"]
    ):

        raise HTTPException(
            status_code=401,
            detail="Invalid email or password"
        )

    role = user.get(
        "role",
        "citizen"
    )

    access_token = create_access_token(

        str(user["_id"]),

        user["email"],

        role

    )

    refresh_token = create_refresh_token(

        str(user["_id"])

    )

    return {

        "success":
            True,

        "message":
            "Login successful",

        "access_token":
            access_token,

        "refresh_token":
            refresh_token,

        "token_type":
            "bearer",

        "user": {

            "id":
                str(user["_id"]),

            "name":
                user.get(
                    "name",
                    ""
                ),

            "email":
                user["email"],

            "role":
                role

        }

    }


# ============================================================
# STANDARD LOGIN
# ============================================================

@app.post("/auth/login")
def login(
    login: UserLogin
):

    return login_user(
        login
    )


# ============================================================
# OLD USER LOGIN
# KEPT FOR FRONTEND COMPATIBILITY
# ============================================================

@app.post("/auth/user/login")
def user_login(
    login: UserLogin
):

    return login_user(

        login,

        allowed_roles=[
            "user",
            "citizen"
        ]

    )


# ============================================================
# ADMIN LOGIN
# ============================================================

@app.post("/auth/admin/login")
def admin_login(
    login: UserLogin
):

    return login_user(

        login,

        allowed_roles=[
            "admin"
        ]

    )


# ============================================================
# WORKER LOGIN
# ============================================================

@app.post("/auth/worker/login")
def worker_login(
    login: UserLogin
):

    return login_user(

        login,

        allowed_roles=[
            "worker"
        ]

    )


# ============================================================
# CURRENT USER
# ============================================================

@app.get("/auth/me")
def get_me(
    current_user=Depends(
        get_current_user
    )
):

    user = current_user["user"]

    return {

        "success":
            True,

        "id":
            str(user["_id"]),

        "name":
            user.get(
                "name",
                ""
            ),

        "email":
            user.get(
                "email",
                ""
            ),

        "phone":
            user.get(
                "phone"
            ),

        "role":
            user.get(
                "role"
            ),

        "department_id":
            user.get(
                "department_id"
            ),

        "worker_id":
            user.get(
                "worker_id"
            ),

        "ward":
            user.get(
                "ward"
            ),

        "is_active":
            user.get(
                "is_active",
                True
            )

    }


# ============================================================
# REFRESH TOKEN
# ============================================================

@app.post("/auth/refresh")
def refresh_token(
    refresh_token: str
):

    token_record = refresh_tokens_collection.find_one(
        {
            "token":
                refresh_token
        }
    )

    if not token_record:

        raise HTTPException(
            status_code=401,
            detail="Invalid refresh token"
        )

    if token_record["expires_at"] < datetime.utcnow():

        refresh_tokens_collection.delete_one(
            {
                "_id":
                    token_record["_id"]
            }
        )

        raise HTTPException(
            status_code=401,
            detail="Refresh token expired"
        )

    user = users_collection.find_one(
        {
            "_id":
                ObjectId(
                    token_record["user_id"]
                )
        }
    )

    if not user:

        raise HTTPException(
            status_code=401,
            detail="User not found"
        )

    access_token = create_access_token(

        str(user["_id"]),

        user["email"],

        user["role"]

    )

    return {

        "success":
            True,

        "access_token":
            access_token,

        "token_type":
            "bearer"

    }


# ============================================================
# LOGOUT
# ============================================================

@app.post("/auth/logout")
def logout(
    refresh_token: str | None = None,
    current_user=Depends(
        get_current_user
    )
):

    if refresh_token:

        refresh_tokens_collection.delete_one(
            {
                "token":
                    refresh_token,

                "user_id":
                    current_user["user_id"]
            }
        )

    return {

        "success":
            True,

        "message":
            "Logged out successfully"

    }


# ============================================================
# KEYWORD AI FALLBACK
# ============================================================

def keyword_analysis(
    description,
    location,
    photo_filename=None
):

    text = description.lower()

    if (
        "pothole" in text
        or "road damage" in text
        or "road broken" in text
        or "road" in text
        or "depression" in text
    ):

        category = "Road"

        incident_type = (
            "Pothole / Road Damage"
        )

    elif (
        "tree" in text
        or "ped" in text
        or "पेड़" in text
    ):

        category = (
            "Environment / Public Safety"
        )

        incident_type = "Fallen Tree"

    elif (
        "water leak" in text
        or "water leakage" in text
        or "pipe burst" in text
        or "paani leak" in text
    ):

        category = "Water"

        incident_type = (
            "Water Leakage"
        )

    elif (
        "street light" in text
        or "streetlight" in text
        or "electric pole" in text
    ):

        category = "Electricity"

        incident_type = (
            "Electrical Infrastructure Problem"
        )

    elif (
        "garbage" in text
        or "waste" in text
        or "trash" in text
        or "kachra" in text
    ):

        category = "Waste"

        incident_type = (
            "Garbage / Waste Problem"
        )

    elif (
        "drain" in text
        or "drainage" in text
        or "sewer" in text
        or "naali" in text
    ):

        category = (
            "Water & Drainage"
        )

        incident_type = (
            "Drainage Problem"
        )

    elif (
        "fire" in text
        or "burning" in text
        or "aag" in text
    ):

        category = "Fire / Hazard"

        incident_type = (
            "Fire Hazard"
        )

    elif (
        "school" in text
        or "classroom" in text
    ):

        category = (
            "Education / Public Facility"
        )

        incident_type = (
            "School Infrastructure Problem"
        )

    elif (
        "hospital" in text
        or "health" in text
    ):

        category = "Health"

        incident_type = (
            "Health Facility Problem"
        )

    else:

        category = "Other"

        incident_type = (
            "General Civic Issue"
        )

    if (
        "dangerous" in text
        or "accident" in text
        or "fire" in text
        or "collapsed" in text
        or "life threatening" in text
        or "emergency" in text
        or "falling" in text
        or "blocked road" in text
        or "rasta band" in text
    ):

        severity = "High"

    elif (
        "large" in text
        or "major" in text
        or "severe" in text
        or "overflow" in text
        or "broken" in text
    ):

        severity = "Medium"

    else:

        severity = "Low"

    if severity == "High":

        priority = "Critical"

    elif severity == "Medium":

        priority = "High"

    else:

        priority = "Normal"

    if (
        "school" in text
        or "hospital" in text
        or "market" in text
        or "main road" in text
        or "rasta" in text
    ):

        affected_area = (
            "Public / High Traffic Area"
        )

    elif (
        "village" in text
        or "colony" in text
        or "neighborhood" in text
        or "ghar" in text
        or "house" in text
    ):

        affected_area = (
            "Residential Area"
        )

    else:

        affected_area = "Local Area"

    work_map = {

        "Road":
            "Road inspection and repair",

        "Environment / Public Safety":
            "Remove fallen tree and clear the affected area",

        "Water":
            "Pipeline inspection and leakage repair",

        "Electricity":
            "Electrical inspection and repair",

        "Waste":
            "Waste collection and area cleaning",

        "Water & Drainage":
            "Drain cleaning and blockage removal",

        "Fire / Hazard":
            "Immediate hazard inspection and emergency response",

        "Education / Public Facility":
            "Facility inspection and infrastructure repair",

        "Health":
            "Health facility inspection",

        "Other":
            "General field inspection"

    }

    required_work = work_map.get(
        category,
        "General field inspection"
    )

    skill_map = {

        "Road": [
            "Road Worker",
            "Civil Engineer"
        ],

        "Environment / Public Safety": [
            "Tree Removal Team",
            "Municipal Worker"
        ],

        "Water": [
            "Plumber",
            "Water Department Worker"
        ],

        "Electricity": [
            "Electrician",
            "Electrical Engineer"
        ],

        "Waste": [
            "Sanitation Worker"
        ],

        "Water & Drainage": [
            "Drainage Worker",
            "Plumber"
        ],

        "Fire / Hazard": [
            "Emergency Response Team",
            "Fire Safety Personnel"
        ],

        "Other": [
            "Field Inspector"
        ]

    }

    required_skills = skill_map.get(
        category,
        ["Field Inspector"]
    )

    cost_map = {

        "Road":
            "₹5,000 - ₹50,000",

        "Environment / Public Safety":
            "Requires Inspection",

        "Water":
            "₹2,000 - ₹25,000",

        "Electricity":
            "₹1,000 - ₹15,000",

        "Waste":
            "₹500 - ₹5,000",

        "Water & Drainage":
            "₹2,000 - ₹20,000",

        "Fire / Hazard":
            "₹10,000+"

    }

    estimated_cost = cost_map.get(
        category,
        "Requires Inspection"
    )

    return {

        "category":
            category,

        "incident_type":
            incident_type,

        "severity":
            severity,

        "priority":
            priority,

        "affected_area":
            affected_area,

        "required_work":
            required_work,

        "required_skills":
            required_skills,

        "estimated_cost":
            estimated_cost

    }


# ============================================================
# GEMINI ANALYSIS
# ============================================================

def gemini_analysis(
    description,
    location
):

    if not gemini_client:

        return None

    prompt = f"""
You are the AI Incident Engine for LokSetu.

Analyze this citizen civic complaint.

The complaint may be written in:
English, Hindi, Hinglish or speech-to-text Hindi.

Complaint:
{description}

Location:
{location}

Return ONLY valid JSON.

Use exactly:

{{
    "category": "",
    "incident_type": "",
    "severity": "",
    "priority": "",
    "affected_area": "",
    "required_work": "",
    "required_skills": [],
    "estimated_cost": ""
}}

Allowed severity:
Low, Medium, High

Allowed priority:
Normal, High, Critical

Required skills must be a JSON array.

Estimated cost should be an approximate range in Indian Rupees.

Classify the actual civic problem.

Do not add explanation outside JSON.
"""

    try:

        response = gemini_client.interactions.create(
            model="gemini-3.8-flash",
            input=prompt
        )

        response_text = ""

        if hasattr(
            response,
            "output_text"
        ):

            response_text = (
                response.output_text
            )

        elif hasattr(
            response,
            "text"
        ):

            response_text = (
                response.text
            )

        else:

            response_text = str(
                response
            )

        response_text = (
            response_text
            .strip()
        )

        if response_text.startswith(
            "```"
        ):

            response_text = (
                response_text
                .replace(
                    "```json",
                    ""
                )
                .replace(
                    "```",
                    ""
                )
                .strip()
            )

        return json.loads(
            response_text
        )

    except Exception as e:

        print(
            "Gemini error:",
            repr(e)
        )

        return None


# ============================================================
# CREATE INCIDENT
# ============================================================

def create_incident(
    description,
    location,
    photo_filename=None,
    user_email=None
):

    ai_result = gemini_analysis(
        description,
        location
    )

    if ai_result:

        analysis = ai_result

        ai_used = "Gemini"

    else:

        analysis = keyword_analysis(
            description,
            location,
            photo_filename
        )

        ai_used = "Keyword Fallback"

    incident = {

        "complaint":
            description,

        "location":
            location,

        "category":
            analysis.get(
                "category",
                "Other"
            ),

        "incident_type":
            analysis.get(
                "incident_type",
                "General Civic Issue"
            ),

        "severity":
            analysis.get(
                "severity",
                "Low"
            ),

        "priority":
            analysis.get(
                "priority",
                "Normal"
            ),

        "affected_area":
            analysis.get(
                "affected_area",
                "Local Area"
            ),

        "required_work":
            analysis.get(
                "required_work",
                "General field inspection"
            ),

        "required_skills":
            analysis.get(
                "required_skills",
                ["Field Inspector"]
            ),

        "estimated_cost":
            analysis.get(
                "estimated_cost",
                "Requires Inspection"
            ),

        "photo":
            photo_filename,

        "user_email":
            user_email,

        "ai_used":
            ai_used,

        "status":
            "Pending",

        "created_at":
            datetime.utcnow()

    }

    result = incidents_collection.insert_one(
        incident
    )

    return {

        "message":
            "Incident analyzed and saved successfully",

        "incident_id":
            str(result.inserted_id),

        "incident": {

            "complaint":
                description,

            "location":
                location,

            "category":
                incident["category"],

            "incident_type":
                incident["incident_type"],

            "photo":
                photo_filename,

            "user_email":
                user_email

        },

        "assessment": {

            "severity":
                incident["severity"],

            "priority":
                incident["priority"],

            "affected_area":
                incident["affected_area"]

        },

        "resolution": {

            "required_work":
                incident["required_work"],

            "required_skills":
                incident["required_skills"],

            "estimated_cost":
                incident["estimated_cost"]

        },

        "ai_used":
            ai_used,

        "status":
            "Pending"

    }


# ============================================================
# OLD COMPLAINT API
# ============================================================

@app.post("/complaint")
def analyze_complaint(
    complaint: Complaint,
    current_user=Depends(
        require_citizen
    )
):

    return create_incident(

        complaint.description,

        complaint.location,

        user_email=current_user["email"]

    )


# ============================================================
# OLD COMPLAINT WITH PHOTO
# ============================================================

@app.post("/complaint-with-photo")
async def complaint_with_photo(

    description: str = Form(...),

    location: str = Form("Unknown"),

    photo: UploadFile = File(...),

    current_user=Depends(
        require_citizen
    )

):

    allowed_types = [

        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp"

    ]

    if photo.content_type not in allowed_types:

        raise HTTPException(

            status_code=400,

            detail=(
                "Only JPG, JPEG, PNG "
                "and WEBP images are allowed"
            )

        )

    timestamp = datetime.utcnow().strftime(
        "%Y%m%d%H%M%S"
    )

    original_name = os.path.basename(
        photo.filename or "photo"
    )

    filename = (
        f"{timestamp}_{original_name}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            photo.file,
            buffer
        )

    return create_incident(

        description,

        location,

        filename,

        user_email=current_user["email"]

    )


# ============================================================
# CREATE MODERN COMPLAINT
# ============================================================

@app.post("/complaints")
def create_modern_complaint(

    complaint: ComplaintCreate,

    current_user=Depends(
        require_citizen
    )

):

    location = complaint.location

    latitude = location.get(
        "latitude"
    )

    longitude = location.get(
        "longitude"
    )

    if latitude is not None:

        if not -90 <= float(latitude) <= 90:

            raise HTTPException(
                status_code=400,
                detail="Invalid latitude"
            )

    if longitude is not None:

        if not -180 <= float(longitude) <= 180:

            raise HTTPException(
                status_code=400,
                detail="Invalid longitude"
            )

    count = complaints_collection.count_documents(
        {}
    ) + 1

    complaint_id = (
        f"LS-{datetime.utcnow().year}-{count:05d}"
    )

    now = datetime.utcnow()

    document = {

        "complaint_id":
            complaint_id,

        "citizen_id":
            current_user["user_id"],

        "title":
            complaint.title,

        "description":
            complaint.description,

        "category":
            complaint.category,

        "location":
            location,

        "photo_urls":
            [],

        "ai_analysis":
            None,

        "status":
            "pending",

        "department_id":
            None,

        "assigned_worker_id":
            None,

        "priority":
            complaint.priority,

        "created_at":
            now,

        "updated_at":
            now,

        "resolved_at":
            None

    }

    result = complaints_collection.insert_one(
        document
    )

    activity_collection.insert_one({

        "complaint_id":
            complaint_id,

        "actor_id":
            current_user["user_id"],

        "actor_role":
            current_user["role"],

        "action":
            "created",

        "description":
            "Complaint created.",

        "created_at":
            now

    })

    return {

        "success":
            True,

        "message":
            "Complaint created successfully",

        "data": {

            "complaint_id":
                complaint_id,

            "id":
                str(result.inserted_id),

            "status":
                "pending"

        }

    }


# ============================================================
# CITIZEN - MY COMPLAINTS
# ============================================================

@app.get("/complaints/my")
def get_my_complaints(

    current_user=Depends(
        require_citizen
    )

):

    complaints = list(

        complaints_collection.find(
            {
                "citizen_id":
                    current_user["user_id"]
            }
        ).sort(
            "created_at",
            DESCENDING
        )

    )

    for complaint in complaints:

        complaint["id"] = str(
            complaint["_id"]
        )

        del complaint["_id"]

        if isinstance(
            complaint.get("created_at"),
            datetime
        ):

            complaint["created_at"] = (
                complaint["created_at"]
                .isoformat()
            )

        if isinstance(
            complaint.get("updated_at"),
            datetime
        ):

            complaint["updated_at"] = (
                complaint["updated_at"]
                .isoformat()
            )

    return {

        "success":
            True,

        "count":
            len(complaints),

        "complaints":
            complaints

    }


# ============================================================
# CITIZEN - SINGLE COMPLAINT
# ============================================================

@app.get(
    "/complaints/{complaint_id}"
)
def get_my_complaint(

    complaint_id: str,

    current_user=Depends(
        get_current_user
    )

):

    complaint = complaints_collection.find_one(
        {
            "complaint_id":
                complaint_id
        }
    )

    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    role = current_user["role"]

    if role in [
        "citizen",
        "user"
    ]:

        if complaint["citizen_id"] != (
            current_user["user_id"]
        ):

            raise HTTPException(
                status_code=403,
                detail="You cannot access this complaint"
            )

    elif role == "worker":

        if complaint.get(
            "assigned_worker_id"
        ) != current_user["user_id"]:

            raise HTTPException(
                status_code=403,
                detail="This complaint is not assigned to you"
            )

    elif role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    complaint["id"] = str(
        complaint["_id"]
    )

    del complaint["_id"]

    return {

        "success":
            True,

        "complaint":
            complaint

    }


# ============================================================
# WORKER TASKS
# ============================================================

@app.get("/worker/tasks")
def worker_tasks(

    current_user=Depends(
        require_worker
    )

):

    worker_id = current_user[
        "user_id"
    ]

    tasks = list(

        complaints_collection.find(
            {
                "assigned_worker_id":
                    worker_id
            }
        ).sort(
            "created_at",
            DESCENDING
        )

    )

    assigned = 0
    in_progress = 0
    completed = 0
    overdue = 0

    now = datetime.utcnow()

    for task in tasks:

        status = task.get(
            "status"
        )

        if status == "assigned":

            assigned += 1

        elif status == "in_progress":

            in_progress += 1

        elif status == "resolved":

            completed += 1

        deadline = task.get(
            "deadline"
        )

        if (
            deadline
            and status not in [
                "resolved",
                "rejected"
            ]
            and deadline < now
        ):

            overdue += 1

        task["id"] = str(
            task["_id"]
        )

        del task["_id"]

    return {

        "success":
            True,

        "summary": {

            "assigned":
                assigned,

            "in_progress":
                in_progress,

            "completed":
                completed,

            "overdue":
                overdue

        },

        "tasks":
            tasks

    }


# ============================================================
# WORKER TASK DETAIL
# ============================================================

@app.get(
    "/worker/tasks/{complaint_id}"
)
def worker_task_detail(

    complaint_id: str,

    current_user=Depends(
        require_worker
    )

):

    complaint = complaints_collection.find_one(
        {
            "complaint_id":
                complaint_id,

            "assigned_worker_id":
                current_user["user_id"]
        }
    )

    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Assigned complaint not found"
        )

    complaint["id"] = str(
        complaint["_id"]
    )

    del complaint["_id"]

    return {

        "success":
            True,

        "task":
            complaint

    }


# ============================================================
# WORKER STATUS
# ============================================================

@app.put(
    "/worker/tasks/{complaint_id}/status"
)
def worker_update_status(

    complaint_id: str,

    status_change: StatusChange,

    current_user=Depends(
        require_worker
    )

):

    allowed_transitions = {

        "assigned":
            ["in_progress"],

        "in_progress":
            ["resolved"]

    }

    complaint = complaints_collection.find_one(
        {
            "complaint_id":
                complaint_id,

            "assigned_worker_id":
                current_user["user_id"]
        }
    )

    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Assigned complaint not found"
        )

    old_status = complaint.get(
        "status"
    )

    allowed = allowed_transitions.get(
        old_status,
        []
    )

    if status_change.status not in allowed:

        raise HTTPException(

            status_code=400,

            detail={
                "message":
                    "Invalid worker status transition",

                "from":
                    old_status,

                "to":
                    status_change.status,

                "allowed":
                    allowed
            }

        )

    now = datetime.utcnow()

    update_data = {

        "status":
            status_change.status,

        "updated_at":
            now

    }

    if status_change.status == "resolved":

        update_data[
            "resolved_at"
        ] = now

    complaints_collection.update_one(

        {
            "_id":
                complaint["_id"]
        },

        {
            "$set":
                update_data
        }

    )

    activity_collection.insert_one({

        "complaint_id":
            complaint_id,

        "actor_id":
            current_user["user_id"],

        "actor_role":
            "worker",

        "action":
            "status_changed",

        "description":
            status_change.note
            or
            f"Status changed from {old_status} to {status_change.status}.",

        "from_status":
            old_status,

        "to_status":
            status_change.status,

        "created_at":
            now

    })

    # Citizen notification

    notifications_collection.insert_one({

        "user_id":
            complaint["citizen_id"],

        "title":
            "Complaint updated",

        "message":
            f"Your complaint {complaint_id} is now {status_change.status}.",

        "type":
            "complaint",

        "read":
            False,

        "created_at":
            now

    })

    return {

        "success":
            True,

        "message":
            "Complaint status updated",

        "complaint_id":
            complaint_id,

        "status":
            status_change.status

    }


# ============================================================
# WORKER NOTES
# ============================================================

@app.post(
    "/worker/tasks/{complaint_id}/notes"
)
def add_worker_note(

    complaint_id: str,

    note: WorkerNote,

    current_user=Depends(
        require_worker
    )

):

    complaint = complaints_collection.find_one(
        {
            "complaint_id":
                complaint_id,

            "assigned_worker_id":
                current_user["user_id"]
        }
    )

    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Assigned complaint not found"
        )

    now = datetime.utcnow()

    activity_collection.insert_one({

        "complaint_id":
            complaint_id,

        "actor_id":
            current_user["user_id"],

        "actor_role":
            "worker",

        "action":
            "worker_note",

        "description":
            note.note,

        "created_at":
            now

    })

    return {

        "success":
            True,

        "message":
            "Worker note added"

    }


# ============================================================
# WORKER PROOF
# ============================================================

@app.post(
    "/worker/tasks/{complaint_id}/proof"
)
async def upload_work_proof(

    complaint_id: str,

    proof_type: str = Form(...),

    photo: UploadFile = File(...),

    current_user=Depends(
        require_worker
    )

):

    if proof_type not in [
        "before",
        "after"
    ]:

        raise HTTPException(
            status_code=400,
            detail="Proof type must be before or after"
        )

    complaint = complaints_collection.find_one(
        {
            "complaint_id":
                complaint_id,

            "assigned_worker_id":
                current_user["user_id"]
        }
    )

    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Assigned complaint not found"
        )

    allowed_types = [

        "image/jpeg",
        "image/png",
        "image/jpg",
        "image/webp"

    ]

    if photo.content_type not in allowed_types:

        raise HTTPException(
            status_code=400,
            detail="Invalid image type"
        )

    timestamp = datetime.utcnow().strftime(
        "%Y%m%d%H%M%S"
    )

    original_name = os.path.basename(
        photo.filename or "proof"
    )

    filename = (
        f"{timestamp}_{proof_type}_{original_name}"
    )

    file_path = os.path.join(
        UPLOAD_FOLDER,
        filename
    )

    with open(
        file_path,
        "wb"
    ) as buffer:

        shutil.copyfileobj(
            photo.file,
            buffer
        )

    proof = {

        "type":
            proof_type,

        "url":
            f"/uploads/{filename}",

        "uploaded_by":
            current_user["user_id"],

        "uploaded_at":
            datetime.utcnow()

    }

    complaints_collection.update_one(

        {
            "_id":
                complaint["_id"]
        },

        {
            "$push": {
                "work_proof":
                    proof
            },

            "$set": {
                "updated_at":
                    datetime.utcnow()
            }

        }

    )

    activity_collection.insert_one({

        "complaint_id":
            complaint_id,

        "actor_id":
            current_user["user_id"],

        "actor_role":
            "worker",

        "action":
            "proof_uploaded",

        "description":
            f"{proof_type.capitalize()} work proof uploaded.",

        "created_at":
            datetime.utcnow()

    })

    return {

        "success":
            True,

        "message":
            "Work proof uploaded",

        "proof":
            proof

    }


# ============================================================
# ADMIN - ALL INCIDENTS
# ============================================================

@app.get("/incidents")
def get_incidents(

    current_user=Depends(
        require_admin
    )

):

    incidents = list(

        incidents_collection.find(

            {},

            {

                "_id": 1,

                "complaint": 1,

                "location": 1,

                "category": 1,

                "incident_type": 1,

                "severity": 1,

                "priority": 1,

                "status": 1,

                "photo": 1,

                "user_email": 1,

                "ai_used": 1,

                "created_at": 1

            }

        ).sort(
            "created_at",
            DESCENDING
        )

    )

    for incident in incidents:

        incident["id"] = str(
            incident["_id"]
        )

        del incident["_id"]

        if isinstance(
            incident.get("created_at"),
            datetime
        ):

            incident["created_at"] = (
                incident["created_at"]
                .isoformat()
            )

    return {

        "count":
            len(incidents),

        "incidents":
            incidents

    }


# ============================================================
# ADMIN - ONE INCIDENT
# ============================================================

@app.get(
    "/incidents/{incident_id}"
)
def get_incident(

    incident_id: str,

    current_user=Depends(
        require_admin
    )

):

    if not ObjectId.is_valid(
        incident_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid incident ID"
        )

    incident = incidents_collection.find_one(

        {
            "_id":
                ObjectId(incident_id)
        }

    )

    if incident is None:

        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    incident["id"] = str(
        incident["_id"]
    )

    del incident["_id"]

    if isinstance(
        incident.get("created_at"),
        datetime
    ):

        incident["created_at"] = (
            incident["created_at"]
            .isoformat()
        )

    return {

        "message":
            "Incident found",

        "incident":
            incident

    }


# ============================================================
# ADMIN - INCIDENT STATUS
# ============================================================

@app.put(
    "/incidents/{incident_id}/status"
)
def update_incident_status(

    incident_id: str,

    status_update: StatusUpdate,

    current_user=Depends(
        require_admin
    )

):

    if not ObjectId.is_valid(
        incident_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid incident ID"
        )

    allowed_statuses = [

        "Pending",
        "Assigned",
        "In Progress",
        "Resolved",
        "Rejected"

    ]

    if status_update.status not in allowed_statuses:

        raise HTTPException(

            status_code=400,

            detail={
                "message":
                    "Invalid status",

                "allowed_statuses":
                    allowed_statuses
            }

        )

    incident = incidents_collection.find_one(

        {
            "_id":
                ObjectId(incident_id)
        }

    )

    if incident is None:

        raise HTTPException(
            status_code=404,
            detail="Incident not found"
        )

    incidents_collection.update_one(

        {
            "_id":
                ObjectId(incident_id)
        },

        {
            "$set": {

                "status":
                    status_update.status,

                "updated_at":
                    datetime.utcnow(),

                "updated_by":
                    current_user["email"]

            }

        }

    )

    return {

        "message":
            "Incident status updated successfully",

        "incident_id":
            incident_id,

        "old_status":
            incident.get("status"),

        "new_status":
            status_update.status

    }


# ============================================================
# ADMIN - COMPLAINTS
# ============================================================

@app.get("/admin/complaints")
def admin_complaints(

    status: str | None = None,

    category: str | None = None,

    department_id: str | None = None,

    ward: str | None = None,

    priority: str | None = None,

    current_user=Depends(
        require_admin
    )

):

    query = {}

    if status:
        query["status"] = status

    if category:
        query["category"] = category

    if department_id:
        query["department_id"] = department_id

    if priority:
        query["priority"] = priority

    if ward:
        query[
            "location.ward"
        ] = ward

    complaints = list(

        complaints_collection.find(
            query
        ).sort(
            "created_at",
            DESCENDING
        )

    )

    for complaint in complaints:

        complaint["id"] = str(
            complaint["_id"]
        )

        del complaint["_id"]

    return {

        "success":
            True,

        "count":
            len(complaints),

        "complaints":
            complaints

    }


# ============================================================
# ADMIN - COMPLAINT DETAIL
# ============================================================

@app.get(
    "/admin/complaints/{complaint_id}"
)
def admin_complaint_detail(

    complaint_id: str,

    current_user=Depends(
        require_admin
    )

):

    complaint = complaints_collection.find_one(
        {
            "complaint_id":
                complaint_id
        }
    )

    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    complaint["id"] = str(
        complaint["_id"]
    )

    del complaint["_id"]

    activities = list(

        activity_collection.find(
            {
                "complaint_id":
                    complaint_id
            }
        ).sort(
            "created_at",
            ASCENDING
        )

    )

    for activity in activities:

        activity["id"] = str(
            activity["_id"]
        )

        del activity["_id"]

    return {

        "success":
            True,

        "complaint":
            complaint,

        "activity":
            activities

    }


# ============================================================
# ADMIN - ASSIGN
# ============================================================

@app.put(
    "/admin/complaints/{complaint_id}/assign"
)
def assign_complaint(

    complaint_id: str,

    assignment: AssignComplaint,

    current_user=Depends(
        require_admin
    )

):

    complaint = complaints_collection.find_one(
        {
            "complaint_id":
                complaint_id
        }
    )

    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    update = {

        "updated_at":
            datetime.utcnow()

    }

    if assignment.department_id:

        update[
            "department_id"
        ] = assignment.department_id

        activity_collection.insert_one({

            "complaint_id":
                complaint_id,

            "actor_id":
                current_user["user_id"],

            "actor_role":
                "admin",

            "action":
                "assigned_department",

            "description":
                f"Complaint assigned to department {assignment.department_id}.",

            "created_at":
                datetime.utcnow()

        })

    if assignment.worker_id:

        worker = users_collection.find_one(
            {
                "_id":
                    ObjectId(
                        assignment.worker_id
                    ),

                "role":
                    "worker",

                "is_active":
                    True
            }
        )

        if not worker:

            raise HTTPException(
                status_code=400,
                detail="Active worker not found"
            )

        update[
            "assigned_worker_id"
        ] = assignment.worker_id

        update[
            "assigned_at"
        ] = datetime.utcnow()

        update[
            "status"
        ] = "assigned"

        activity_collection.insert_one({

            "complaint_id":
                complaint_id,

            "actor_id":
                current_user["user_id"],

            "actor_role":
                "admin",

            "action":
                "assigned_worker",

            "description":
                f"Complaint assigned to worker {worker.get('worker_id', assignment.worker_id)}.",

            "created_at":
                datetime.utcnow()

        })

        notifications_collection.insert_one({

            "user_id":
                assignment.worker_id,

            "title":
                "New task assigned",

            "message":
                f"Complaint {complaint_id} has been assigned to you.",

            "type":
                "complaint",

            "read":
                False,

            "created_at":
                datetime.utcnow()

        })

    complaints_collection.update_one(

        {
            "_id":
                complaint["_id"]
        },

        {
            "$set":
                update
        }

    )

    return {

        "success":
            True,

        "message":
            "Complaint assignment updated"

    }


# ============================================================
# ADMIN - STATUS
# ============================================================

@app.put(
    "/admin/complaints/{complaint_id}/status"
)
def admin_change_status(

    complaint_id: str,

    status_change: StatusChange,

    current_user=Depends(
        require_admin
    )

):

    allowed_statuses = [

        "pending",
        "assigned",
        "in_progress",
        "resolved",
        "rejected"

    ]

    if status_change.status not in allowed_statuses:

        raise HTTPException(
            status_code=400,
            detail="Invalid complaint status"
        )

    complaint = complaints_collection.find_one(
        {
            "complaint_id":
                complaint_id
        }
    )

    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    old_status = complaint.get(
        "status"
    )

    now = datetime.utcnow()

    update = {

        "status":
            status_change.status,

        "updated_at":
            now

    }

    if status_change.status == "resolved":

        update[
            "resolved_at"
        ] = now

    complaints_collection.update_one(

        {
            "_id":
                complaint["_id"]
        },

        {
            "$set":
                update
        }

    )

    activity_collection.insert_one({

        "complaint_id":
            complaint_id,

        "actor_id":
            current_user["user_id"],

        "actor_role":
            "admin",

        "action":
            "status_changed",

        "description":
            status_change.note
            or
            f"Status changed from {old_status} to {status_change.status}.",

        "from_status":
            old_status,

        "to_status":
            status_change.status,

        "created_at":
            now

    })

    notifications_collection.insert_one({

        "user_id":
            complaint["citizen_id"],

        "title":
            "Complaint status updated",

        "message":
            f"Your complaint {complaint_id} is now {status_change.status}.",

        "type":
            "complaint",

        "read":
            False,

        "created_at":
            now

    })

    return {

        "success":
            True,

        "message":
            "Complaint status updated",

        "status":
            status_change.status

    }


# ============================================================
# DEPARTMENTS
# ============================================================

@app.get("/departments")
def get_departments():

    departments = list(
        departments_collection.find(
            {
                "is_active":
                    True
            }
        )
    )

    for department in departments:

        department["id"] = str(
            department["_id"]
        )

        del department["_id"]

    return {

        "success":
            True,

        "departments":
            departments

    }


@app.post("/admin/departments")
def create_department(

    department: DepartmentCreate,

    current_user=Depends(
        require_admin
    )

):

    existing = departments_collection.find_one(
        {
            "code":
                department.code
        }
    )

    if existing:

        raise HTTPException(
            status_code=409,
            detail="Department code already exists"
        )

    result = departments_collection.insert_one({

        "name":
            department.name,

        "code":
            department.code,

        "description":
            department.description,

        "is_active":
            True,

        "created_at":
            datetime.utcnow()

    })

    return {

        "success":
            True,

        "message":
            "Department created",

        "id":
            str(result.inserted_id)

    }


@app.get(
    "/admin/departments/{department_id}"
)
def get_department(

    department_id: str,

    current_user=Depends(
        require_admin
    )

):

    if not ObjectId.is_valid(
        department_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid department ID"
        )

    department = departments_collection.find_one(
        {
            "_id":
                ObjectId(department_id)
        }
    )

    if not department:

        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    department["id"] = str(
        department["_id"]
    )

    del department["_id"]

    return {

        "success":
            True,

        "department":
            department

    }


@app.put(
    "/admin/departments/{department_id}"
)
def update_department(

    department_id: str,

    department: DepartmentCreate,

    current_user=Depends(
        require_admin
    )

):

    if not ObjectId.is_valid(
        department_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid department ID"
        )

    result = departments_collection.update_one(

        {
            "_id":
                ObjectId(department_id)
        },

        {
            "$set": {

                "name":
                    department.name,

                "code":
                    department.code,

                "description":
                    department.description,

                "updated_at":
                    datetime.utcnow()

            }

        }

    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    return {

        "success":
            True,

        "message":
            "Department updated"

    }


@app.delete(
    "/admin/departments/{department_id}"
)
def delete_department(

    department_id: str,

    current_user=Depends(
        require_admin
    )

):

    if not ObjectId.is_valid(
        department_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid department ID"
        )

    result = departments_collection.update_one(

        {
            "_id":
                ObjectId(department_id)
        },

        {
            "$set": {
                "is_active":
                    False
            }

        }

    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Department not found"
        )

    return {

        "success":
            True,

        "message":
            "Department deactivated"

    }


# ============================================================
# ADMIN WORKERS
# ============================================================

@app.get("/admin/workers")
def get_workers(

    current_user=Depends(
        require_admin
    )

):

    workers = list(

        users_collection.find(
            {
                "role":
                    "worker"
            }
        )
    )

    for worker in workers:

        worker["id"] = str(
            worker["_id"]
        )

        worker.pop(
            "_id",
            None
        )

        worker.pop(
            "password_hash",
            None
        )

    return {

        "success":
            True,

        "workers":
            workers

    }


@app.post("/admin/workers")
def create_worker(

    user: UserRegister,

    current_user=Depends(
        require_admin
    )

):

    email = (
        user.email
        .strip()
        .lower()
    )

    if users_collection.find_one(
        {
            "email":
                email
        }
    ):

        raise HTTPException(
            status_code=409,
            detail="Email already exists"
        )

    worker_id = (
        "W-"
        + secrets.token_hex(3).upper()
    )

    result = users_collection.insert_one({

        "name":
            user.name,

        "email":
            email,

        "phone":
            user.phone,

        "password_hash":
            hash_password(
                user.password
            ),

        "role":
            "worker",

        "worker_id":
            worker_id,

        "department_id":
            None,

        "ward":
            user.ward,

        "is_active":
            True,

        "created_at":
            datetime.utcnow()

    })

    return {

        "success":
            True,

        "message":
            "Worker created",

        "worker": {

            "id":
                str(result.inserted_id),

            "worker_id":
                worker_id,

            "name":
                user.name,

            "email":
                email

        }

    }


@app.get(
    "/admin/workers/{worker_id}"
)
def get_worker(

    worker_id: str,

    current_user=Depends(
        require_admin
    )

):

    if not ObjectId.is_valid(
        worker_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid worker ID"
        )

    worker = users_collection.find_one(
        {
            "_id":
                ObjectId(worker_id),

            "role":
                "worker"
        }
    )

    if not worker:

        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    worker["id"] = str(
        worker["_id"]
    )

    del worker["_id"]

    worker.pop(
        "password_hash",
        None
    )

    workload = complaints_collection.count_documents(
        {
            "assigned_worker_id":
                worker_id,

            "status":
                {
                    "$nin":
                        [
                            "resolved",
                            "rejected"
                        ]
                }
        }
    )

    worker[
        "active_workload"
    ] = workload

    return {

        "success":
            True,

        "worker":
            worker

    }


@app.put(
    "/admin/workers/{worker_id}/status"
)
def update_worker_status(

    worker_id: str,

    active: bool,

    current_user=Depends(
        require_admin
    )

):

    if not ObjectId.is_valid(
        worker_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid worker ID"
        )

    result = users_collection.update_one(

        {
            "_id":
                ObjectId(worker_id),

            "role":
                "worker"
        },

        {
            "$set": {
                "is_active":
                    active
            }
        }

    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Worker not found"
        )

    return {

        "success":
            True,

        "message":
            "Worker status updated",

        "is_active":
            active

    }


# ============================================================
# ADMIN DASHBOARD
# ============================================================

@app.get("/admin/dashboard")
def admin_dashboard(

    current_user=Depends(
        require_admin
    )

):

    total = complaints_collection.count_documents({})

    pending = complaints_collection.count_documents(
        {
            "status":
                "pending"
        }
    )

    in_progress = complaints_collection.count_documents(
        {
            "status":
                "in_progress"
        }
    )

    resolved = complaints_collection.count_documents(
        {
            "status":
                "resolved"
        }
    )

    active_citizens = users_collection.count_documents(

        {
            "role":
                {
                    "$in":
                        [
                            "citizen",
                            "user"
                        ]
                },

            "is_active":
                True

        }

    )

    active_workers = users_collection.count_documents(

        {
            "role":
                "worker",

            "is_active":
                True

        }

    )

    wards = complaints_collection.distinct(
        "location.ward"
    )

    resolution_rate = 0

    if total > 0:

        resolution_rate = round(
            (
                resolved / total
            ) * 100,
            2
        )

    recent = list(

        complaints_collection.find(
            {}
        )
        .sort(
            "created_at",
            DESCENDING
        )
        .limit(10)

    )

    for item in recent:

        item["id"] = str(
            item["_id"]
        )

        del item["_id"]

    return {

        "success":
            True,

        "data": {

            "total_complaints":
                total,

            "pending":
                pending,

            "in_progress":
                in_progress,

            "resolved":
                resolved,

            "resolution_rate":
                resolution_rate,

            "active_citizens":
                active_citizens,

            "active_workers":
                active_workers,

            "active_wards":
                len(wards),

            "department_workload":
                [],

            "recent_complaints":
                recent

        }

    }


# ============================================================
# UPDATES
# ============================================================

@app.get("/updates")
def get_public_updates():

    updates = list(

        updates_collection.find(
            {
                "status":
                    "published"
            }
        ).sort(
            "published_at",
            DESCENDING
        )

    )

    for update in updates:

        update["id"] = str(
            update["_id"]
        )

        del update["_id"]

    return {

        "success":
            True,

        "updates":
            updates

    }


@app.get(
    "/updates/{update_id}"
)
def get_update(
    update_id: str
):

    if not ObjectId.is_valid(
        update_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid update ID"
        )

    update = updates_collection.find_one(
        {
            "_id":
                ObjectId(update_id),

            "status":
                "published"
        }
    )

    if not update:

        raise HTTPException(
            status_code=404,
            detail="Update not found"
        )

    update["id"] = str(
        update["_id"]
    )

    del update["_id"]

    return {

        "success":
            True,

        "update":
            update

    }


@app.post("/admin/updates")
def create_update(

    update: UpdateCreate,

    current_user=Depends(
        require_admin
    )

):

    now = datetime.utcnow()

    document = {

        "title":
            update.title,

        "description":
            update.description,

        "category":
            update.category,

        "ward":
            update.ward,

        "status":
            update.status,

        "created_by":
            current_user["user_id"],

        "created_at":
            now,

        "published_at":
            now
            if update.status == "published"
            else None

    }

    result = updates_collection.insert_one(
        document
    )

    return {

        "success":
            True,

        "message":
            "Update created",

        "id":
            str(result.inserted_id)

    }


# ============================================================
# NOTIFICATIONS
# ============================================================

@app.get("/notifications")
def get_notifications(

    current_user=Depends(
        get_current_user
    )

):

    notifications = list(

        notifications_collection.find(
            {
                "user_id":
                    current_user["user_id"]
            }
        ).sort(
            "created_at",
            DESCENDING
        )

    )

    for notification in notifications:

        notification["id"] = str(
            notification["_id"]
        )

        del notification["_id"]

    return {

        "success":
            True,

        "notifications":
            notifications

    }


@app.put(
    "/notifications/{notification_id}/read"
)
def mark_notification_read(

    notification_id: str,

    current_user=Depends(
        get_current_user
    )

):

    if not ObjectId.is_valid(
        notification_id
    ):

        raise HTTPException(
            status_code=400,
            detail="Invalid notification ID"
        )

    result = notifications_collection.update_one(

        {
            "_id":
                ObjectId(notification_id),

            "user_id":
                current_user["user_id"]
        },

        {
            "$set": {
                "read":
                    True
            }
        }

    )

    if result.matched_count == 0:

        raise HTTPException(
            status_code=404,
            detail="Notification not found"
        )

    return {

        "success":
            True,

        "message":
            "Notification marked as read"

    }


@app.put(
    "/notifications/read-all"
)
def mark_all_notifications_read(

    current_user=Depends(
        get_current_user
    )

):

    notifications_collection.update_many(

        {
            "user_id":
                current_user["user_id"],

            "read":
                False
        },

        {
            "$set": {
                "read":
                    True
            }
        }

    )

    return {

        "success":
            True,

        "message":
            "All notifications marked as read"

    }


# ============================================================
# ACTIVITY TIMELINE
# ============================================================

@app.get(
    "/complaints/{complaint_id}/activity"
)
def complaint_activity(

    complaint_id: str,

    current_user=Depends(
        get_current_user
    )

):

    complaint = complaints_collection.find_one(
        {
            "complaint_id":
                complaint_id
        }
    )

    if not complaint:

        raise HTTPException(
            status_code=404,
            detail="Complaint not found"
        )

    role = current_user["role"]

    if role in [
        "citizen",
        "user"
    ]:

        if complaint[
            "citizen_id"
        ] != current_user["user_id"]:

            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

    elif role == "worker":

        if complaint.get(
            "assigned_worker_id"
        ) != current_user["user_id"]:

            raise HTTPException(
                status_code=403,
                detail="Access denied"
            )

    elif role != "admin":

        raise HTTPException(
            status_code=403,
            detail="Access denied"
        )

    activities = list(

        activity_collection.find(
            {
                "complaint_id":
                    complaint_id
            }
        ).sort(
            "created_at",
            ASCENDING
        )

    )

    for activity in activities:

        activity["id"] = str(
            activity["_id"]
        )

        del activity["_id"]

    return {

        "success":
            True,

        "activity":
            activities

    }


# ============================================================
# SERVER START
# ============================================================

if __name__ == "__main__":

    import uvicorn

    uvicorn.run(

        "main:app",

        host="0.0.0.0",

        port=8000,

        reload=True

    )