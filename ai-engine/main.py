from fastapi import FastAPI, HTTPException, UploadFile, File, Form
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from pymongo import MongoClient
from bson import ObjectId
from datetime import datetime
from google import genai
import os
from dotenv import load_dotenv
load_dotenv()
import shutil
import json


app = FastAPI(
    title="LokSetu AI Incident Engine",
    description="AI engine for analyzing citizen complaints",
    version="3.1.0"
)


# -----------------------------
# CORS
# -----------------------------

app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173"
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


# -----------------------------
# MONGODB ATLAS CONNECTION
# -----------------------------

MONGODB_URI = os.getenv("MONGODB_URI")

if not MONGODB_URI:
    raise RuntimeError(
        "MONGODB_URI environment variable is not set."
    )

client = MongoClient(MONGODB_URI)

db = client["loksetu"]

incidents_collection = db["incidents"]


# -----------------------------
# GEMINI CONNECTION
# -----------------------------

GEMINI_API_KEY = os.getenv("GEMINI_API_KEY")

gemini_client = None

if GEMINI_API_KEY:

    gemini_client = genai.Client(
        api_key=GEMINI_API_KEY
    )


# -----------------------------
# PHOTO UPLOAD FOLDER
# -----------------------------

UPLOAD_FOLDER = "uploads"

os.makedirs(
    UPLOAD_FOLDER,
    exist_ok=True
)


# -----------------------------
# INPUT MODELS
# -----------------------------

class Complaint(BaseModel):

    description: str

    location: str = "Unknown"


class StatusUpdate(BaseModel):

    status: str


# -----------------------------
# HOME
# -----------------------------

@app.get("/")
def home():

    return {

        "project": "LokSetu",

        "module": "AI Incident Engine",

        "status": "running",

        "database": "MongoDB Atlas",

        "ai_engine":
            "Gemini"
            if gemini_client
            else
            "Keyword Fallback"

    }


# -----------------------------
# KEYWORD FALLBACK
# -----------------------------

def keyword_analysis(
    description,
    location,
    photo_filename=None
):

    text = description.lower()


    # ROAD

    if (
        "pothole" in text
        or "road damage" in text
        or "road broken" in text
        or "road" in text
        or "depression" in text
    ):

        category = "Road"

        incident_type = "Pothole / Road Damage"


    # FALLEN TREE

    elif (
        "tree" in text
        or "ped" in text
        or "पेड़" in text
    ):

        category = "Environment / Public Safety"

        incident_type = "Fallen Tree"


    # WATER

    elif (
        "water leak" in text
        or "water leakage" in text
        or "pipe burst" in text
        or "paani leak" in text
    ):

        category = "Water"

        incident_type = "Water Leakage"


    # ELECTRICITY

    elif (
        "street light" in text
        or "streetlight" in text
        or "electric pole" in text
    ):

        category = "Electricity"

        incident_type = "Electrical Infrastructure Problem"


    # WASTE

    elif (
        "garbage" in text
        or "waste" in text
        or "trash" in text
        or "kachra" in text
    ):

        category = "Waste"

        incident_type = "Garbage / Waste Problem"


    # DRAINAGE

    elif (
        "drain" in text
        or "drainage" in text
        or "sewer" in text
        or "naali" in text
    ):

        category = "Water & Drainage"

        incident_type = "Drainage Problem"


    # FIRE

    elif (
        "fire" in text
        or "burning" in text
        or "aag" in text
    ):

        category = "Fire / Hazard"

        incident_type = "Fire Hazard"


    # SCHOOL

    elif (
        "school" in text
        or "classroom" in text
    ):

        category = "Education / Public Facility"

        incident_type = "School Infrastructure Problem"


    # HOSPITAL

    elif (
        "hospital" in text
        or "health" in text
    ):

        category = "Health"

        incident_type = "Health Facility Problem"


    else:

        category = "Other"

        incident_type = "General Civic Issue"


    # -----------------------------
    # SEVERITY
    # -----------------------------

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


    # -----------------------------
    # PRIORITY
    # -----------------------------

    if severity == "High":

        priority = "Critical"

    elif severity == "Medium":

        priority = "High"

    else:

        priority = "Normal"


    # -----------------------------
    # AFFECTED AREA
    # -----------------------------

    if (
        "school" in text
        or "hospital" in text
        or "market" in text
        or "main road" in text
        or "rasta" in text
    ):

        affected_area = "Public / High Traffic Area"


    elif (
        "village" in text
        or "colony" in text
        or "neighborhood" in text
        or "ghar" in text
        or "house" in text
    ):

        affected_area = "Residential Area"


    else:

        affected_area = "Local Area"


    # -----------------------------
    # REQUIRED WORK
    # -----------------------------

    if category == "Road":

        required_work = (
            "Road inspection and repair"
        )


    elif category == "Environment / Public Safety":

        required_work = (
            "Remove fallen tree and clear the affected area"
        )


    elif category == "Water":

        required_work = (
            "Pipeline inspection and leakage repair"
        )


    elif category == "Electricity":

        required_work = (
            "Electrical inspection and repair"
        )


    elif category == "Waste":

        required_work = (
            "Waste collection and area cleaning"
        )


    elif category == "Water & Drainage":

        required_work = (
            "Drain cleaning and blockage removal"
        )


    elif category == "Fire / Hazard":

        required_work = (
            "Immediate hazard inspection and emergency response"
        )


    elif category == "Education / Public Facility":

        required_work = (
            "Facility inspection and infrastructure repair"
        )


    elif category == "Health":

        required_work = (
            "Health facility inspection"
        )


    else:

        required_work = (
            "General field inspection"
        )


    # -----------------------------
    # REQUIRED SKILLS
    # -----------------------------

    if category == "Road":

        required_skills = [
            "Road Worker",
            "Civil Engineer"
        ]


    elif category == "Environment / Public Safety":

        required_skills = [
            "Tree Removal Team",
            "Municipal Worker"
        ]


    elif category == "Water":

        required_skills = [
            "Plumber",
            "Water Department Worker"
        ]


    elif category == "Electricity":

        required_skills = [
            "Electrician",
            "Electrical Engineer"
        ]


    elif category == "Waste":

        required_skills = [
            "Sanitation Worker"
        ]


    elif category == "Water & Drainage":

        required_skills = [
            "Drainage Worker",
            "Plumber"
        ]


    elif category == "Fire / Hazard":

        required_skills = [
            "Emergency Response Team",
            "Fire Safety Personnel"
        ]


    else:

        required_skills = [
            "Field Inspector"
        ]


    # -----------------------------
    # ESTIMATED COST
    # -----------------------------

    if category == "Road":

        estimated_cost = "₹5,000 - ₹50,000"


    elif category == "Environment / Public Safety":

        estimated_cost = "Requires Inspection"


    elif category == "Water":

        estimated_cost = "₹2,000 - ₹25,000"


    elif category == "Electricity":

        estimated_cost = "₹1,000 - ₹15,000"


    elif category == "Waste":

        estimated_cost = "₹500 - ₹5,000"


    elif category == "Water & Drainage":

        estimated_cost = "₹2,000 - ₹20,000"


    elif category == "Fire / Hazard":

        estimated_cost = "₹10,000+"


    else:

        estimated_cost = "Requires Inspection"


    return {

        "category": category,

        "incident_type": incident_type,

        "severity": severity,

        "priority": priority,

        "affected_area": affected_area,

        "required_work": required_work,

        "required_skills": required_skills,

        "estimated_cost": estimated_cost

    }


# -----------------------------
# GEMINI AI ANALYSIS
# -----------------------------

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
- English
- Hindi
- Hinglish
- Speech-to-text Hindi

Understand the meaning regardless of language.

Complaint:
{description}

Location:
{location}

Return ONLY valid JSON.

Use exactly these fields:

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

Allowed severity values:
Low, Medium, High

Allowed priority values:
Normal, High, Critical

Required skills must be a JSON array.

Estimated cost should be an approximate range in Indian Rupees.

Classify the actual problem described in the complaint.

For example, if the complaint says:
"mere ghar ke pass ped gir gaya hai"

classify it as a fallen tree/public safety incident,
not as a house infrastructure problem.

Do not classify an incident only because a school,
hospital, house, or other building is mentioned.

Do not add any explanation outside the JSON.
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

            response_text = response.text


        else:

            response_text = str(response)


        response_text = (
            response_text.strip()
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


        result = json.loads(
            response_text
        )


        return result


    except Exception as e:

        print(
            "Gemini error:",
            repr(e)
        )

        return None


# -----------------------------
# CREATE INCIDENT
# -----------------------------

def create_incident(
    description,
    location,
    photo_filename=None
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
                photo_filename

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


# -----------------------------
# COMPLAINT WITHOUT PHOTO
# -----------------------------

@app.post("/complaint")
def analyze_complaint(
    complaint: Complaint
):

    return create_incident(

        complaint.description,

        complaint.location

    )


# -----------------------------
# COMPLAINT WITH PHOTO
# -----------------------------

@app.post("/complaint-with-photo")
async def complaint_with_photo(

    description: str = Form(...),

    location: str = Form("Unknown"),

    photo: UploadFile = File(...)

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
        photo.filename
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

        filename

    )


# -----------------------------
# GET ALL INCIDENTS
# -----------------------------

@app.get("/incidents")
def get_incidents():

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

                "ai_used": 1,

                "created_at": 1

            }

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


# -----------------------------
# GET ONE INCIDENT
# -----------------------------

@app.get(
    "/incidents/{incident_id}"
)
def get_incident(

    incident_id: str

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


# -----------------------------
# UPDATE INCIDENT STATUS
# -----------------------------

@app.put(
    "/incidents/{incident_id}/status"
)
def update_incident_status(

    incident_id: str,

    status_update: StatusUpdate

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

        "Resolved"

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
                    datetime.utcnow()

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