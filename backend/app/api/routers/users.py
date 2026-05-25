from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session
from sqlalchemy import func
from app.config.database import get_db
from app.models.user import User
from app.models.document import Document
from app.api.deps import get_current_user

router = APIRouter()

def get_admin_user(current_user: User = Depends(get_current_user)):
    if current_user.username != "admin":
        raise HTTPException(
            status_code=status.HTTP_403_FORBIDDEN,
            detail="You do not have permission to access this resource. Admin only."
        )
    return current_user

@router.get("/all")
async def get_all_users(db: Session = Depends(get_db), admin_user: User = Depends(get_admin_user)):
    """
    Fetch all users and their document counts.
    Restricted to admin user.
    """
    # Join users and documents to get the count
    results = db.query(
        User.id,
        User.username,
        func.count(Document.id).label("document_count")
    ).outerjoin(Document, User.id == Document.user_id).group_by(User.id).all()

    users_data = [
        {
            "id": r.id,
            "username": r.username,
            "document_count": r.document_count
        }
        for r in results
    ]

    return {
        "status": "success",
        "data": users_data
    }
