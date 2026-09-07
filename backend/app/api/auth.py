from fastapi import APIRouter, Depends, HTTPException, status
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.orm import Session
from app.database.session import get_db
from app.models.log import User, AuditLog
from app.core.security import verify_password, get_password_hash, create_access_token, decode_access_token
from fastapi.security import OAuth2PasswordBearer

router = APIRouter(prefix="/auth", tags=["Authentication"])
oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")

class RegisterRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr
    password: str = Field(..., min_length=6)
    confirm_password: str = Field(..., min_length=6)

class LoginRequest(BaseModel):
    email: EmailStr
    password: str

class ProfileUpdateRequest(BaseModel):
    name: str = Field(..., min_length=2, max_length=100)
    email: EmailStr

class PasswordChangeRequest(BaseModel):
    current_password: str
    new_password: str = Field(..., min_length=6)

def get_current_user(token: str = Depends(oauth2_scheme), db: Session = Depends(get_db)) -> User:
    """Dependency to retrieve authenticated user from JWT token."""
    payload = decode_access_token(token)
    if not payload or "sub" not in payload:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Invalid or expired authentication credentials",
            headers={"WWW-Authenticate": "Bearer"},
        )
    user_id = payload["sub"]
    user = db.query(User).filter(User.id == user_id).first()
    if not user:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="User account not found",
            headers={"WWW-Authenticate": "Bearer"},
        )
    return user

@router.post("/register", status_code=status.HTTP_201_CREATED)
def register_user(payload: RegisterRequest, db: Session = Depends(get_db)):
    """Register a new user administrator."""
    if payload.password != payload.confirm_password:
        return {
            "success": False,
            "error": {"code": "VALIDATION_ERROR", "message": "Passwords do not match"}
        }

    existing = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if existing:
        return {
            "success": False,
            "error": {"code": "USER_EXISTS", "message": "An account with this email address already exists"}
        }

    new_user = User(
        name=payload.name.strip(),
        email=payload.email.lower().strip(),
        password_hash=get_password_hash(payload.password),
        role="Security Administrator"
    )
    db.add(new_user)
    db.commit()
    db.refresh(new_user)

    # Log audit event
    db.add(AuditLog(user_id=new_user.id, event_type="USER_REGISTERED", description=f"User registered: {new_user.email}"))
    db.commit()

    token = create_access_token({"sub": new_user.id, "email": new_user.email, "name": new_user.name})
    return {
        "success": True,
        "data": {
            "token": token,
            "user": {
                "id": new_user.id,
                "name": new_user.name,
                "email": new_user.email,
                "role": new_user.role,
                "created_at": new_user.created_at.isoformat() if new_user.created_at else None
            }
        },
        "message": "Account created successfully"
    }

@router.post("/login")
def login_user(payload: LoginRequest, db: Session = Depends(get_db)):
    """Authenticate user with email and password, returning JWT token."""
    user = db.query(User).filter(User.email == payload.email.lower().strip()).first()
    if not user or not verify_password(payload.password, user.password_hash):
        return {
            "success": False,
            "error": {"code": "INVALID_CREDENTIALS", "message": "Invalid email or password"}
        }

    token = create_access_token({"sub": user.id, "email": user.email, "name": user.name})
    return {
        "success": True,
        "data": {
            "token": token,
            "user": {
                "id": user.id,
                "name": user.name,
                "email": user.email,
                "role": user.role,
                "created_at": user.created_at.isoformat() if user.created_at else None
            }
        },
        "message": "Authenticated successfully"
    }

@router.get("/me")
def get_user_profile(current_user: User = Depends(get_current_user)):
    """Retrieve currently authenticated user profile."""
    return {
        "success": True,
        "data": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role,
            "created_at": current_user.created_at.isoformat() if current_user.created_at else None
        },
        "message": "User profile fetched"
    }

@router.put("/profile")
def update_profile(
    payload: ProfileUpdateRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Update profile name and email."""
    # Check if new email is taken by someone else
    if payload.email.lower().strip() != current_user.email:
        conflict = db.query(User).filter(User.email == payload.email.lower().strip(), User.id != current_user.id).first()
        if conflict:
            return {
                "success": False,
                "error": {"code": "EMAIL_TAKEN", "message": "Email already in use by another account"}
            }
        current_user.email = payload.email.lower().strip()

    current_user.name = payload.name.strip()
    db.commit()
    return {
        "success": True,
        "data": {
            "id": current_user.id,
            "name": current_user.name,
            "email": current_user.email,
            "role": current_user.role
        },
        "message": "Profile updated successfully"
    }

@router.put("/password")
def change_password(
    payload: PasswordChangeRequest,
    current_user: User = Depends(get_current_user),
    db: Session = Depends(get_db)
):
    """Change current user's password securely."""
    if not verify_password(payload.current_password, current_user.password_hash):
        return {
            "success": False,
            "error": {"code": "INVALID_PASSWORD", "message": "Current password is incorrect"}
        }

    current_user.password_hash = get_password_hash(payload.new_password)
    db.commit()
    return {
        "success": True,
        "data": {},
        "message": "Password changed successfully"
    }
