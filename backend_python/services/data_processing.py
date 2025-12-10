from typing import List, Dict, Any
import re
import logging

logger = logging.getLogger(__name__)

def find_key(keys: List[str], props: Dict[str, Any], regex_pattern: str = None, prop_type: str = None, default: str = None) -> str:
    for k in keys:
        if prop_type and props[k].get("type") == prop_type:
            return k
        if regex_pattern and re.search(regex_pattern, k, re.IGNORECASE):
            return k
    return default

def process_leads(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    clean_leads = []
    for page in results:
        try:
            props = page.get("properties", {})
            keys = list(props.keys())

            title_key = find_key(keys, props, prop_type='title', default='Name')
            name = "Sin Nombre"
            if title_key and props[title_key].get("title"):
                name = props[title_key]["title"][0].get("plain_text", "Sin Nombre")

            address_key = find_key(keys, props, regex_pattern=r'address|direcci|ubicaci')
            address = "Dirección no especificada"
            if address_key:
                rich_text = props[address_key].get("rich_text", [])
                if rich_text:
                    address = rich_text[0].get("plain_text", address)

            phone_key = find_key(keys, props, regex_pattern=r'phone|tel')
            phone = ""
            if phone_key:
                phone_prop = props[phone_key]
                if phone_prop.get("phone_number"):
                    phone = phone_prop.get("phone_number")
                elif phone_prop.get("rich_text"):
                        phone = phone_prop["rich_text"][0].get("plain_text", "")

            web_key = find_key(keys, props, regex_pattern=r'web|url')
            website = ""
            if web_key:
                website = props[web_key].get("url", "")

            class_key = find_key(keys, props, regex_pattern=r'clase|class')
            clase = 'C'
            if class_key:
                c_prop = props[class_key]
                if c_prop.get("type") == 'select' and c_prop.get("select"):
                    clase = c_prop["select"].get("name", "C")
                elif c_prop.get("type") == 'rich_text' and c_prop.get("rich_text"):
                    clase = c_prop["rich_text"][0].get("plain_text", "C")
            
            agent_key = find_key(keys, props, regex_pattern=r'responsable|agent')
            agent = 'Sin Asignar'
            if agent_key and props[agent_key].get("select"):
                agent = props[agent_key]["select"].get("name", "Sin Asignar")

            notion_data = {
                "claseColName": class_key or 'Clase',
                "claseColType": props.get(class_key, {}).get("type", "select") if class_key else "select"
            }

            clean_leads.append({
                "id": page.get("id"),
                "name": name,
                "address": address,
                "phone": phone,
                "website": website,
                "category": 'Otros',
                "clase": clase,
                "agent": agent,
                "isSelected": False,
                "isSynced": True,
                "notionData": notion_data
            })

        except Exception as e:
            logger.error(f"Error processing lead page {page.get('id')}: {e}")
            continue
    
    return clean_leads

def process_history(results: List[Dict[str, Any]]) -> List[Dict[str, Any]]:
    clean_history = []
    for page in results:
        try:
            props = page.get("properties", {})
            keys = list(props.keys())
            
            title_key = find_key(keys, props, prop_type='title', default='Asesor')
            agent_name = "Sistema"
            if title_key and props[title_key].get("title"):
                    agent_name = props[title_key]["title"][0].get("plain_text", "Sistema")
            
            type_key = find_key(keys, props, regex_pattern=r'contacto|prospeccion', default='Contacto')
            type_prop = props.get(type_key)
            title = "Nota"
            if type_prop:
                if type_prop.get("rich_text"):
                    title = type_prop["rich_text"][0].get("plain_text", "Nota")
                elif type_prop.get("select"):
                    title = type_prop["select"].get("name", "Nota")
            
            desc_key = find_key(keys, props, regex_pattern=r'comentario|detalle|descri', default='Comentario')
            description = ""
            if props.get(desc_key) and props[desc_key].get("rich_text"):
                    description = props[desc_key]["rich_text"][0].get("plain_text", "")
            
            # Client ID strategies
            client_id = None
            
            # Strategy 1: Explicit relation name
            explicit_client_key = find_key(keys, props, regex_pattern=r'cliente|empresa|lead|relation')
            
            for k in keys:
                if re.search(r'cliente|empresa|lead|relation', k, re.IGNORECASE) and props[k].get("type") == "relation":
                        if props[k]["relation"]:
                            client_id = props[k]["relation"][0]["id"]
                            break
            
            # Strategy 2: Any relation
            if not client_id:
                for k in keys:
                    if props[k].get("type") == "relation" and props[k]["relation"]:
                        client_id = props[k]["relation"][0]["id"]
                        break
                        
            # Strategy 4: Fallback Client Name
            client_name_fallback = None
            if not client_id:
                name_key = find_key(keys, props, regex_pattern=r'cliente|empresa|lead')
                if name_key:
                    p = props[name_key]
                    if p.get("type") == "select":
                        client_name_fallback = p["select"].get("name")
                    elif p.get("type") == "rich_text" and p["rich_text"]:
                        client_name_fallback = p["rich_text"][0].get("plain_text")

            date_key = find_key(keys, props, regex_pattern=r'fecha|date')
            date_str = page.get("created_time")
            if date_key and props[date_key].get("date"):
                date_str = props[date_key]["date"].get("start")
            
            from datetime import datetime
            dt = datetime.fromisoformat(date_str.replace('Z', '+00:00'))
            timestamp = dt.strftime("%b %d, %H:%M") 

            item_type = 'note'
            t_lower = title.lower()
            if 'llamada' in t_lower or 'tel' in t_lower:
                item_type = 'call'
            if 'mail' in t_lower or 'correo' in t_lower or 'what' in t_lower:
                item_type = 'email'

            clean_history.append({
                "id": page.get("id"),
                "type": item_type,
                "title": title,
                "timestamp": timestamp,
                "isoDate": date_str,
                "description": description,
                "user": {"name": agent_name, "avatarUrl": ""},
                "clientId": client_id,
                "clientName": client_name_fallback,
                "isSynced": True
            })

        except Exception as e:
            logger.error(f"Error processing history item {page.get('id')}: {e}")
            continue
    
    return clean_history
