"""
Firebase to Notion Sync API Router
Handles syncing data from Firebase Firestore to Notion databases
"""
from fastapi import APIRouter, HTTPException, Depends
from pydantic import BaseModel
from typing import List, Dict, Optional
from datetime import datetime
import sys
sys.path.append('/app/backend')

from notion_helpers import (
    sync_p62_product, sync_p62_plan, sync_p62_order,
    sync_rmss_topic, sync_rmss_kb,
    sync_aisy_topic, sync_aisy_analytics,
    update_global_analytics, batch_sync_to_notion
)

# Import Firebase from project62_api
from project62_api import db as firestore_db, get_current_admin

router = APIRouter(prefix="/api/ccc/sync", tags=["CCC Sync"])

# ============================================
# PYDANTIC MODELS
# ============================================

class SyncResponse(BaseModel):
    status: str
    synced: int
    failed: int
    errors: Optional[List[str]] = []

# ============================================
# PROJECT 62 SYNC ENDPOINTS
# ============================================

@router.post("/project62/products")
async def sync_project62_products(current_user: dict = Depends(get_current_admin)):
    """Sync all Project 62 products from Firebase to Notion"""
    try:
        # Fetch products from Firebase
        products_ref = firestore_db.collection("project62").document("products").collection("all")
        products = [doc.to_dict() for doc in products_ref.stream()]
        
        synced = 0
        failed = 0
        errors = []
        
        for product in products:
            product_data = {
                "name": product.get("name", ""),
                "calories": product.get("calories", 0),
                "price": float(product.get("price", 0)),
                "category": product.get("category", "Main"),
                "active": product.get("active", True)
            }
            
            result = sync_p62_product(product_data)
            if result.get("success"):
                synced += 1
            else:
                failed += 1
                errors.append(result.get("error"))
        
        return {
            "status": "success",
            "synced": synced,
            "failed": failed,
            "errors": errors[:5]  # Return first 5 errors
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/project62/plans")
async def sync_project62_plans(current_user: dict = Depends(get_current_admin)):
    """Sync all Project 62 subscription plans from Firebase to Notion"""
    try:
        plans_ref = firestore_db.collection("project62").document("subscriptions_config").collection("all")
        plans = [doc.to_dict() for doc in plans_ref.stream()]
        
        synced = 0
        failed = 0
        errors = []
        
        for plan in plans:
            # Format pricing tiers into inclusions string
            inclusions = []
            if plan.get("pricing_tiers"):
                for tier in plan["pricing_tiers"]:
                    inclusions.append(f"{tier['weeks']}W: ${tier['price_per_meal']}/meal")
            
            plan_data = {
                "plan_name": plan.get("plan_name", ""),
                "duration": f"{plan.get('weeks', 0)} weeks",
                "price": float(plan.get("base_price", 0)),
                "inclusions": ", ".join(inclusions)
            }
            
            result = sync_p62_plan(plan_data)
            if result.get("success"):
                synced += 1
            else:
                failed += 1
                errors.append(result.get("error"))
        
        return {
            "status": "success",
            "synced": synced,
            "failed": failed,
            "errors": errors[:5]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/project62/orders")
async def sync_project62_orders(current_user: dict = Depends(get_current_admin)):
    """Sync all Project 62 orders from Firebase to Notion"""
    try:
        orders_ref = firestore_db.collection("project62").document("orders").collection("all")
        orders = [doc.to_dict() for doc in orders_ref.stream()]
        
        synced = 0
        failed = 0
        errors = []
        
        for order in orders:
            order_data = {
                "order_id": order.get("order_id", ""),
                "customer": order.get("customer_email", ""),
                "plan": order.get("plan_name", ""),
                "start_date": order.get("start_date", datetime.utcnow().isoformat()),
                "status": order.get("status", "Pending").capitalize()
            }
            
            result = sync_p62_order(order_data)
            if result.get("success"):
                synced += 1
            else:
                failed += 1
                errors.append(result.get("error"))
        
        return {
            "status": "success",
            "synced": synced,
            "failed": failed,
            "errors": errors[:5]
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@router.post("/project62/all")
async def sync_project62_all(current_user: dict = Depends(get_current_admin)):
    """Sync all Project 62 data (products, plans, orders) at once"""
    try:
        results = {}
        
        # Sync products
        products_result = await sync_project62_products(current_user)
        results["products"] = products_result
        
        # Sync plans
        plans_result = await sync_project62_plans(current_user)
        results["plans"] = plans_result
        
        # Sync orders
        orders_result = await sync_project62_orders(current_user)
        results["orders"] = orders_result
        
        # Update global analytics
        total_synced = (
            products_result["synced"] + 
            plans_result["synced"] + 
            orders_result["synced"]
        )
        
        analytics_result = update_global_analytics(
            "Project 62",
            {
                "active_users": len([o for o in firestore_db.collection("project62").document("customers").collection("all").stream()]),
                "revenue": 0,  # Calculate from orders if needed
                "engagement": total_synced,
                "updated_at": datetime.utcnow().isoformat()
            }
        )
        results["analytics"] = analytics_result
        
        return {
            "status": "success",
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# RMSS SYNC ENDPOINTS
# ============================================

@router.post("/rmss/topics")
async def sync_rmss_topics(current_user: dict = Depends(get_current_admin)):
    """Sync RMSS topics from Firebase to Notion (placeholder - add when RMSS Firebase is set up)"""
    try:
        # TODO: Implement when RMSS Firebase collections are created
        return {
            "status": "pending",
            "message": "RMSS Firebase collections not yet created",
            "synced": 0,
            "failed": 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# AISY SYNC ENDPOINTS
# ============================================

@router.post("/aisy/topics")
async def sync_aisy_topics(current_user: dict = Depends(get_current_admin)):
    """Sync AISY topics from Firebase to Notion (placeholder - add when AISY Firebase is set up)"""
    try:
        # TODO: Implement when AISY Firebase collections are created
        return {
            "status": "pending",
            "message": "AISY Firebase collections not yet created",
            "synced": 0,
            "failed": 0
        }
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# GLOBAL ANALYTICS ENDPOINTS
# ============================================

@router.post("/analytics/update-all")
async def update_all_analytics(current_user: dict = Depends(get_current_admin)):
    """Update global analytics for all projects"""
    try:
        results = {}
        
        # Project 62 Analytics
        p62_customers = list(firestore_db.collection("project62").document("customers").collection("all").stream())
        p62_orders = list(firestore_db.collection("project62").document("orders").collection("all").stream())
        
        p62_result = update_global_analytics(
            "Project 62",
            {
                "active_users": len(p62_customers),
                "revenue": 0,  # Calculate from orders
                "engagement": len(p62_orders),
                "updated_at": datetime.utcnow().isoformat()
            }
        )
        results["project62"] = p62_result
        
        # CCC Agency Analytics (placeholder)
        ccc_result = update_global_analytics(
            "CCC Agency",
            {
                "active_users": 0,
                "revenue": 0,
                "engagement": 0,
                "updated_at": datetime.utcnow().isoformat()
            }
        )
        results["ccc_agency"] = ccc_result
        
        # RMSS Analytics (placeholder)
        rmss_result = update_global_analytics(
            "RMSS Chatbot",
            {
                "active_users": 0,
                "revenue": 0,
                "engagement": 0,
                "updated_at": datetime.utcnow().isoformat()
            }
        )
        results["rmss"] = rmss_result
        
        # AISY Analytics (placeholder)
        aisy_result = update_global_analytics(
            "AISY Math Tutor",
            {
                "active_users": 0,
                "revenue": 0,
                "engagement": 0,
                "updated_at": datetime.utcnow().isoformat()
            }
        )
        results["aisy"] = aisy_result
        
        return {
            "status": "success",
            "updated_projects": 4,
            "results": results
        }
    
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# ============================================
# SCHEDULED SYNC (Called by cron/scheduler)
# ============================================

@router.post("/scheduled/sync-all")
async def scheduled_sync_all():
    """
    Scheduled endpoint to sync all data from Firebase to Notion
    Should be called daily by APScheduler or cron job
    """
    try:
        results = {}
        
        # Note: This endpoint should ideally use a service account token
        # For now, it will require admin auth
        
        print("🔄 Running scheduled sync...")
        
        # Sync Project 62 (without auth check for scheduled jobs)
        # In production, use service account credentials
        
        return {
            "status": "success",
            "message": "Scheduled sync requires service account implementation",
            "timestamp": datetime.utcnow().isoformat()
        }
    
    except Exception as e:
        return {
            "status": "error",
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }

# ============================================
# HEALTH CHECK
# ============================================

@router.get("/health")
async def health_check():
    """Check if Notion integration is working"""
    try:
        from notion_helpers import notion, DB_IDS
        
        # Try to query a database
        result = notion.databases.retrieve(database_id=DB_IDS["analytics_global"])
        
        return {
            "status": "healthy",
            "notion_connected": True,
            "databases_accessible": len(DB_IDS),
            "timestamp": datetime.utcnow().isoformat()
        }
    except Exception as e:
        return {
            "status": "unhealthy",
            "notion_connected": False,
            "error": str(e),
            "timestamp": datetime.utcnow().isoformat()
        }
