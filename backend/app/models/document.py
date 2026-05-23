from sqlalchemy import Column, Integer, String, Text, DateTime, ForeignKey
import datetime
from app.config.database import Base
from sqlalchemy.orm import relationship

class Document(Base):
    __tablename__ = "documents"

    id = Column(Integer, primary_key=True, index=True)
    filename = Column(String, index=True, nullable=False)
    extracted_text = Column(Text, nullable=False)
    upload_date = Column(DateTime, default=datetime.datetime.utcnow)
    user_id = Column(Integer, ForeignKey("users.id"), nullable=False)

    owner = relationship("User")
