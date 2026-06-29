from pydantic import BaseModel
from typing import List, Optional

class HistoryEntry(BaseModel):
    status: str
    message: str
    time: str

class IssueCreate(BaseModel):
    title: str
    description: str
    category: str
    severity: str
    latitude: float
    longitude: float
    image: str
    isVideo: bool
    reporter: str
    history: List[HistoryEntry]
    priorityScore: Optional[float] = 0.0
    estimatedCompletion: Optional[str] = ""

class IssueResponse(BaseModel):
    id: str
    title: str
    description: str
    category: str
    severity: str
    status: str
    latitude: float
    longitude: float
    image: str
    isVideo: bool
    reporter: str
    upvotes: int
    flags: int
    timestamp: str
    verifiedBy: List[str]
    flaggedBy: List[str]
    history: List[HistoryEntry]
    proofImage: Optional[str] = ""
    aiResolutionFeedback: Optional[str] = ""
    priorityScore: Optional[float] = 0.0
    estimatedCompletion: Optional[str] = ""

class UserResponse(BaseModel):
    id: str
    name: str
    points: int
    badges: List[str]
    issuesCount: int
    verifiedCount: int
    isMe: bool
