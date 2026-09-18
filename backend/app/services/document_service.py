import os
import shutil
import uuid
from fastapi import UploadFile, HTTPException, status
from sqlalchemy.orm import Session
from app.models.document import DocumentFile
from app.models.user import User

# Base directory for local file storage
# Resolves to /app/data/documents inside the container (2 levels up from /app/app/services/)
STORAGE_DIR = os.path.abspath(os.path.join(os.path.dirname(__file__), "../../data/documents"))
os.makedirs(STORAGE_DIR, exist_ok=True)

class DocumentService:
    @staticmethod
    def upload_document(db: Session, file: UploadFile, current_user: User) -> DocumentFile:
        """
        Securely uploads a document to local storage and creates a database record.
        """
        allowed_types = ["application/pdf", "image/jpeg", "image/png"]
        if file.content_type not in allowed_types:
            raise HTTPException(
                status_code=status.HTTP_400_BAD_REQUEST,
                detail=f"File type {file.content_type} not permitted."
            )
            
        # Generate a secure internal storage key
        storage_key = str(uuid.uuid4())
        file_extension = os.path.splitext(file.filename)[1]
        secure_filename = f"{storage_key}{file_extension}"
        file_path = os.path.join(STORAGE_DIR, secure_filename)
        
        # Save file to disk
        try:
            with open(file_path, "wb") as buffer:
                shutil.copyfileobj(file.file, buffer)
            file_size = os.path.getsize(file_path)
        except Exception as e:
            raise HTTPException(
                status_code=status.HTTP_500_INTERNAL_SERVER_ERROR,
                detail="Could not save file to disk"
            )
            
        # Create database record
        document_file = DocumentFile(
            storage_key=storage_key,
            original_filename=file.filename,
            file_type=file.content_type,
            file_size=file_size,
            uploaded_by_id=current_user.id
        )
        db.add(document_file)
        db.commit()
        db.refresh(document_file)
        
        return document_file

    @staticmethod
    def get_document_path(db: Session, storage_key: str) -> str:
        """
        Returns the absolute local path for a given storage key.
        Security Note: Caller must enforce authorization before calling this.
        """
        doc = db.query(DocumentFile).filter(DocumentFile.storage_key == storage_key).first()
        if not doc:
            raise HTTPException(status_code=404, detail="Document file not found")
            
        # Deduce extension from original filename to reconstruct local path
        file_extension = os.path.splitext(doc.original_filename)[1]
        secure_filename = f"{storage_key}{file_extension}"
        file_path = os.path.abspath(os.path.join(STORAGE_DIR, secure_filename))
        
        if not os.path.exists(file_path):
            raise HTTPException(status_code=404, detail="Physical file missing from storage")
            
        return file_path
