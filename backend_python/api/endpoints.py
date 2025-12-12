from fastapi import APIRouter, HTTPException, Request, Body, Depends
from typing import Optional, Dict, Any, List
from services.notion_service import NotionService
from services.ai_service import AIService
from models.schemas import LeadCreate, ClientCreate, HistoryCreate, GenerateLeadsRequest
import os
import httpx
import logging

router = APIRouter()
notion_service = NotionService()
ai_service = AIService()

logger = logging.getLogger(__name__)

@router.post("/ai/generate-leads")
async def generate_leads(request: GenerateLeadsRequest):
    try:
        return await ai_service.generate_leads(request.location)
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@router.get("/leads")
async def get_leads():
    try:
        return await notion_service.get_leads()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/leads")
async def create_lead(lead: LeadCreate):
    try:
        # Pydantic model to dict
        return await notion_service.create_lead(lead.dict(exclude_unset=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/history")
async def get_history(startDate: Optional[str] = None, endDate: Optional[str] = None):
    try:
        return await notion_service.get_history(startDate, endDate)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/history")
async def create_history_item(item: HistoryCreate):
    try:
        # leadId is alias for clientId in schema if needed, but here we expect leadId or clientId
        # The schema uses 'leadId' or 'clientId'? Schema defined: leadId: str = Field(..., alias="clientId")
        # Frontend sends 'leadId' usually? Or 'clientId'?
        # AppContext sends: activeTab === 'clients' ? addClientHistory : addHistory
        # addHistory sends { leadId, text, agent, interactionType } via POST body if using old service?
        # Let's check notion_service.ts.
        # It sends JSON body.
        # schema has: leadId = Field(..., alias="clientId")
        # So it accepts "clientId" in JSON and maps to leadId field? Or vice versa?
        # Pydantic alias behavior: by default alias is used for validation if populate_by_name is False.
        # I set allow_population_by_field_name = True.
        # So it accepts either 'leadId' or 'clientId'.
        # notion_service.create_history expects separate args.
        
        return await notion_service.create_history(item.leadId, item.text, item.agent, item.interactionType)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.patch("/pages/{page_id}")
async def update_page(page_id: str, body: Dict[str, Any] = Body(...)):
    try:
        # Keeping flexible for now or define schema
        properties = body.get("properties")
        archived = body.get("archived", False)
        # Not implementing full logic here as it wasn't there before
        return {"status": "received"} 
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# --- CLIENTS ENDPOINTS ---

@router.get("/clients")
async def get_clients():
    try:
        return await notion_service.get_clients()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clients")
async def create_client(client: ClientCreate):
    try:
        return await notion_service.create_client(client.dict(exclude_unset=True))
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))


@router.get("/support-tickets")
async def get_support_tickets():
    try:
        return await notion_service.get_support_tickets()
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.get("/clients/history")
async def get_clients_history(startDate: Optional[str] = None, endDate: Optional[str] = None):
    try:
        return await notion_service.get_clients_history(startDate, endDate)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/clients/history")
async def create_client_history_item(item: HistoryCreate):
    try:
        # Reusing HistoryCreate as it has same fields
        return await notion_service.create_client_history(item.leadId, item.text, item.agent, item.interactionType)
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/webhook")
async def webhook_proxy(request: Request):
    """
    Proxy for N8N Webhook to avoid CORS issues
    """
    body = await request.json()
    webhook_url = 'https://automatizaciones-n8n.tzudkj.easypanel.host/webhook/COTIZACION'
    
    try:
        async with httpx.AsyncClient() as client:
            response = await client.post(webhook_url, json=body)
            
        if response.status_code >= 200 and response.status_code < 300:
             return {"success": True}
        else:
             logger.error(f"N8N Error: {response.text}")
             raise HTTPException(status_code=response.status_code, detail="Webhook failed")

    except Exception as e:
        logger.error(f"Webhook Proxy Error: {e}")
        raise HTTPException(status_code=500, detail=str(e))
