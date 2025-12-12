from pydantic import BaseModel, Field, EmailStr
from typing import Optional, List, Any

class LeadCreate(BaseModel):
    name: str
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    address: Optional[str] = None
    website: Optional[str] = None
    status: Optional[str] = "Prospecto"
    clase: Optional[str] = "C"

class ClientCreate(BaseModel):
    name: str
    contactName: Optional[str] = None
    phone: Optional[str] = None
    email: Optional[EmailStr] = None
    rfc: Optional[str] = None
    status: Optional[str] = "Activo"

class HistoryCreate(BaseModel):
    leadId: str = Field(..., alias="clientId") # Start with clientId as it's what frontend sends often, but handle alias if needed
    text: str
    agent: str
    interactionType: str

    class Config:
        allow_population_by_field_name = True

class GenerateLeadsRequest(BaseModel):
    location: str
