"""
Notion Helper Functions for CCC Digital Ecosystem
Provides reusable functions for interacting with Notion databases
"""
from notion_client import Client
from typing import Dict, List, Any
import os

# Initialize Notion client
NOTION_TOKEN = os.getenv("NOTION_TOKEN", "***REMOVED***")
notion = Client(auth=NOTION_TOKEN)

# Database IDs (from creation script)
DB_IDS = {
    "clients": "6c60386f-7bf2-4c7d-bd50-be0b74a97a91",
    "projects": "6f0ba0f9-b6c4-440f-9e46-8600a3a36950",
    "credits": "b8ef904f-1753-4831-b5ba-540adf5ee3ac",
    "integrations": "e854642c-19d9-462b-a058-23a7950e57f5",
    "p62_products": "59aa4cc3-f146-4fcc-9029-5f653c177671",
    "p62_plans": "4276b655-623b-4ecf-9409-327dc5c27921",
    "p62_orders": "4247b50e-baca-41f9-bef5-2aa04d6571d2",
    "rmss_topics": "72835d14-f0d3-4517-90cd-e41a9cf2b135",
    "rmss_kb": "66f223de-894d-47c7-ad20-f406553954f7",
    "aisy_topics": "8bd5273c-bf4c-4440-a8da-edba169d4fc1",
    "aisy_prompts": "133abad0-297b-47e2-b8b1-ba5d98ce75aa",
    "aisy_resources": "fb893860-f5ac-4bec-82c8-cfcd629c2abe",
    "aisy_analytics": "ac64f297-f2cd-40f8-83ca-f633dfd550cd",
    "analytics_global": "c66cc8dc-2272-49a6-bec8-ff3ae735b4ac"
}

def create_page_in_database(database_id: str, properties: Dict[str, Any]) -> Dict:
    """Create a new page (row) in a Notion database"""
    try:
        response = notion.pages.create(
            parent={"database_id": database_id},
            properties=properties
        )
        return {"success": True, "page_id": response["id"]}
    except Exception as e:
        return {"success": False, "error": str(e)}

def update_page(page_id: str, properties: Dict[str, Any]) -> Dict:
    """Update an existing Notion page"""
    try:
        response = notion.pages.update(
            page_id=page_id,
            properties=properties
        )
        return {"success": True, "page_id": response["id"]}
    except Exception as e:
        return {"success": False, "error": str(e)}

def query_database(database_id: str, filter_conditions: Dict = None) -> List[Dict]:
    """Query a Notion database with optional filters"""
    try:
        query_params = {"database_id": database_id}
        if filter_conditions:
            query_params["filter"] = filter_conditions
        
        response = notion.databases.query(**query_params)
        return response.get("results", [])
    except Exception as e:
        print(f"Error querying database: {e}")
        return []

def find_page_by_property(database_id: str, property_name: str, value: str) -> Dict:
    """Find a page in database by a specific property value"""
    try:
        results = notion.databases.query(
            database_id=database_id,
            filter={
                "property": property_name,
                "rich_text": {"equals": value}
            }
        )
        
        if results.get("results"):
            return {"found": True, "page": results["results"][0]}
        return {"found": False}
    except Exception as e:
        return {"found": False, "error": str(e)}

# ============================================
# PROJECT 62 HELPERS
# ============================================

def sync_p62_product(product_data: Dict) -> Dict:
    """Sync a Project 62 product to Notion"""
    properties = {
        "Name": {"title": [{"text": {"content": product_data.get("name", "")}}]},
        "Calories": {"number": product_data.get("calories", 0)},
        "Price": {"number": product_data.get("price", 0)},
        "Category": {"select": {"name": product_data.get("category", "Main")}},
        "Active": {"checkbox": product_data.get("active", True)}
    }
    return create_page_in_database(DB_IDS["p62_products"], properties)

def sync_p62_plan(plan_data: Dict) -> Dict:
    """Sync a Project 62 subscription plan to Notion"""
    properties = {
        "PlanName": {"title": [{"text": {"content": plan_data.get("plan_name", "")}}]},
        "Duration": {"rich_text": [{"text": {"content": plan_data.get("duration", "")}}]},
        "Price": {"number": plan_data.get("price", 0)},
        "Inclusions": {"rich_text": [{"text": {"content": plan_data.get("inclusions", "")}}]}
    }
    return create_page_in_database(DB_IDS["p62_plans"], properties)

def sync_p62_order(order_data: Dict) -> Dict:
    """Sync a Project 62 order to Notion"""
    properties = {
        "OrderID": {"title": [{"text": {"content": order_data.get("order_id", "")}}]},
        "Customer": {"rich_text": [{"text": {"content": order_data.get("customer", "")}}]},
        "Plan": {"rich_text": [{"text": {"content": order_data.get("plan", "")}}]},
        "StartDate": {"date": {"start": order_data.get("start_date", "")}},
        "Status": {"select": {"name": order_data.get("status", "Pending")}}
    }
    return create_page_in_database(DB_IDS["p62_orders"], properties)

# ============================================
# RMSS HELPERS
# ============================================

def sync_rmss_topic(topic_data: Dict) -> Dict:
    """Sync an RMSS topic to Notion"""
    properties = {
        "Topic": {"title": [{"text": {"content": topic_data.get("topic", "")}}]},
        "Level": {"rich_text": [{"text": {"content": topic_data.get("level", "")}}]},
        "Notes": {"rich_text": [{"text": {"content": topic_data.get("notes", "")}}]}
    }
    return create_page_in_database(DB_IDS["rmss_topics"], properties)

def sync_rmss_kb(kb_data: Dict) -> Dict:
    """Sync an RMSS knowledge base item to Notion"""
    properties = {
        "FAQ": {"title": [{"text": {"content": kb_data.get("faq", "")}}]},
        "Answer": {"rich_text": [{"text": {"content": kb_data.get("answer", "")}}]},
        "Tags": {"multi_select": [{"name": tag} for tag in kb_data.get("tags", [])]}
    }
    return create_page_in_database(DB_IDS["rmss_kb"], properties)

# ============================================
# AISY HELPERS
# ============================================

def sync_aisy_topic(topic_data: Dict) -> Dict:
    """Sync an AISY topic to Notion"""
    properties = {
        "Name": {"title": [{"text": {"content": topic_data.get("name", "")}}]},
        "Level": {"select": {"name": topic_data.get("level", "Lower Sec")}},
        "PDF_Link": {"url": topic_data.get("pdf_link", "")},
        "Video_Link": {"url": topic_data.get("video_link", "")},
        "Difficulty": {"number": topic_data.get("difficulty", 1)},
        "SyllabusTag": {"rich_text": [{"text": {"content": topic_data.get("syllabus_tag", "")}}]}
    }
    return create_page_in_database(DB_IDS["aisy_topics"], properties)

def sync_aisy_analytics(analytics_data: Dict) -> Dict:
    """Sync AISY student analytics to Notion"""
    properties = {
        "StudentID": {"title": [{"text": {"content": analytics_data.get("student_id", "")}}]},
        "Topic": {"rich_text": [{"text": {"content": analytics_data.get("topic", "")}}]},
        "Score": {"number": analytics_data.get("score", 0)},
        "Attempts": {"number": analytics_data.get("attempts", 0)},
        "LastUpdated": {"date": {"start": analytics_data.get("last_updated", "")}}
    }
    return create_page_in_database(DB_IDS["aisy_analytics"], properties)

# ============================================
# ANALYTICS HELPERS
# ============================================

def update_global_analytics(project_name: str, metrics: Dict) -> Dict:
    """Update or create global analytics entry for a project"""
    # Check if entry exists
    existing = find_page_by_property(DB_IDS["analytics_global"], "Project", project_name)
    
    properties = {
        "Project": {"title": [{"text": {"content": project_name}}]},
        "ActiveUsers": {"number": metrics.get("active_users", 0)},
        "Revenue": {"number": metrics.get("revenue", 0)},
        "Engagement": {"number": metrics.get("engagement", 0)},
        "UpdatedAt": {"date": {"start": metrics.get("updated_at", "")}}
    }
    
    if existing.get("found"):
        # Update existing
        return update_page(existing["page"]["id"], properties)
    else:
        # Create new
        return create_page_in_database(DB_IDS["analytics_global"], properties)

# ============================================
# BATCH OPERATIONS
# ============================================

def batch_sync_to_notion(database_key: str, items: List[Dict], sync_function) -> Dict:
    """Batch sync multiple items to a Notion database"""
    results = {
        "total": len(items),
        "success": 0,
        "failed": 0,
        "errors": []
    }
    
    for item in items:
        result = sync_function(item)
        if result.get("success"):
            results["success"] += 1
        else:
            results["failed"] += 1
            results["errors"].append(result.get("error"))
    
    return results
