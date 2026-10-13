"""Sample CRUD routes for the Item resource (auth-protected).

This is the reference pattern for adding your own resources — see
docs/ADDING_A_RESOURCE.md.
"""
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.orm import Session

from app.database import get_db
from app.models.item import Item
from app.models.user import User
from app.schemas.common import Message
from app.schemas.item import ItemCreate, ItemRead, ItemUpdate
from app.utils.deps import get_current_user

router = APIRouter(prefix="/items", tags=["items"])


def _get_owned_item(db: Session, item_id: int, user: User) -> Item:
    item = db.get(Item, item_id)
    if item is None or item.owner_id != user.id:
        raise HTTPException(
            status_code=status.HTTP_404_NOT_FOUND, detail="Item not found"
        )
    return item


@router.get("", response_model=list[ItemRead])
def list_items(
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> list[Item]:
    stmt = select(Item).where(Item.owner_id == current_user.id).order_by(Item.id.desc())
    return list(db.scalars(stmt).all())


@router.post("", response_model=ItemRead, status_code=status.HTTP_201_CREATED)
def create_item(
    data: ItemCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Item:
    item = Item(**data.model_dump(), owner_id=current_user.id)
    db.add(item)
    db.commit()
    db.refresh(item)
    return item


@router.get("/{item_id}", response_model=ItemRead)
def get_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Item:
    return _get_owned_item(db, item_id, current_user)


@router.patch("/{item_id}", response_model=ItemRead)
def update_item(
    item_id: int,
    data: ItemUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Item:
    item = _get_owned_item(db, item_id, current_user)
    for field, value in data.model_dump(exclude_unset=True).items():
        setattr(item, field, value)
    db.commit()
    db.refresh(item)
    return item


@router.delete("/{item_id}", response_model=Message)
def delete_item(
    item_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
) -> Message:
    item = _get_owned_item(db, item_id, current_user)
    db.delete(item)
    db.commit()
    return Message(detail="Item deleted")
