import pytest
from fastapi import UploadFile, HTTPException
from io import BytesIO
from sqlalchemy.orm import Session
from app.services.document_service import DocumentService
from app.models.user import User

def test_upload_document_success(db_session: Session):
    # Mock user
    user = User(id=1, email="test@adroit.com", hashed_password="fake_hash", is_active=True, is_superuser=False)
    db_session.add(user)
    db_session.commit()

    # Mock file
    file_content = b"fake pdf content"
    file = UploadFile(filename="test.pdf", file=BytesIO(file_content), headers={"content-type": "application/pdf"})
    
    doc_file = DocumentService.upload_document(db_session, file, user)
    
    assert doc_file is not None
    assert doc_file.original_filename == "test.pdf"
    assert doc_file.file_type == "application/pdf"
    assert doc_file.uploaded_by_id == user.id

def test_upload_document_invalid_type(db_session: Session):
    user = db_session.query(User).filter(User.id == 1).first()
    
    # Mock invalid file type (e.g., txt)
    file_content = b"fake txt content"
    file = UploadFile(filename="test.txt", file=BytesIO(file_content), headers={"content-type": "text/plain"})
    
    with pytest.raises(HTTPException) as exc_info:
        DocumentService.upload_document(db_session, file, user)
        
    assert exc_info.value.status_code == 400
    assert "not permitted" in exc_info.value.detail
