"""Database tables for ShareA'Bite."""
from datetime import datetime, timezone

from sqlalchemy import JSON, Boolean, DateTime, Float, ForeignKey, Integer, String, Text, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship

from app.database import Base


def now_utc() -> datetime:
    return datetime.now(timezone.utc)


class User(Base):
    __tablename__ = "users"

    id: Mapped[int] = mapped_column(primary_key=True)
    email: Mapped[str | None] = mapped_column(String(255), unique=True, index=True)
    password_hash: Mapped[str | None] = mapped_column(String(255))
    name: Mapped[str] = mapped_column(String(80), default="Kawan")
    is_guest: Mapped[bool] = mapped_column(Boolean, default=False)
    campus: Mapped[str] = mapped_column(String(120), default="")
    # Preferences (onboarding + settings)
    daily_budget: Mapped[int] = mapped_column(Integer, default=15000)
    shop_budget: Mapped[int] = mapped_column(Integer, default=35000)
    prefs: Mapped[list] = mapped_column(JSON, default=list)  # e.g. ["Halal", "Pedas", "Kompor"]
    allergies: Mapped[str] = mapped_column(String(255), default="")
    reminder_time: Mapped[str] = mapped_column(String(5), default="19:00")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Ingredient(Base):
    """Price table: one row per ingredient, priced per `unit`."""

    __tablename__ = "ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(80), unique=True)
    unit: Mapped[str] = mapped_column(String(20))
    price_per_unit: Mapped[float] = mapped_column(Float)  # Rp per unit
    category: Mapped[str] = mapped_column(String(20))  # Sayuran | Protein | Bumbu | Karbo
    kcal: Mapped[float] = mapped_column(Float, default=0)  # per unit
    protein: Mapped[float] = mapped_column(Float, default=0)
    carbs: Mapped[float] = mapped_column(Float, default=0)
    is_meat: Mapped[bool] = mapped_column(Boolean, default=False)  # excluded for Vegetarian
    is_pantry: Mapped[bool] = mapped_column(Boolean, default=False)  # usually already at the kos
    is_spicy: Mapped[bool] = mapped_column(Boolean, default=False)
    # Cheaper alternative: swap this ingredient for `swap_qty` × swap_to
    swap_to_id: Mapped[int | None] = mapped_column(ForeignKey("ingredients.id"))
    swap_ratio: Mapped[float] = mapped_column(Float, default=1.0)
    swap_to: Mapped["Ingredient | None"] = relationship(remote_side="Ingredient.id")


class Recipe(Base):
    __tablename__ = "recipes"

    id: Mapped[int] = mapped_column(primary_key=True)
    title: Mapped[str] = mapped_column(String(120))
    art: Mapped[int] = mapped_column(Integer, default=1)  # which plate illustration (1-3)
    color: Mapped[str] = mapped_column(String(9), default="#F4B82E")
    minutes: Mapped[int] = mapped_column(Integer, default=15)
    servings: Mapped[int] = mapped_column(Integer, default=1)
    tip: Mapped[str] = mapped_column(Text, default="")
    tools: Mapped[list] = mapped_column(JSON, default=list)  # any of: Kompor, Rice cooker, Microwave
    source: Mapped[str] = mapped_column(String(12), default="seed")  # seed | ai | variant
    parent_id: Mapped[int | None] = mapped_column(ForeignKey("recipes.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)

    items: Mapped[list["RecipeIngredient"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan", order_by="RecipeIngredient.id"
    )
    steps: Mapped[list["RecipeStep"]] = relationship(
        back_populates="recipe", cascade="all, delete-orphan", order_by="RecipeStep.idx"
    )


class RecipeIngredient(Base):
    __tablename__ = "recipe_ingredients"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"), index=True)
    ingredient_id: Mapped[int] = mapped_column(ForeignKey("ingredients.id"))
    qty: Mapped[float] = mapped_column(Float)
    step_idx: Mapped[int] = mapped_column(Integer, default=0)  # first step that uses it

    recipe: Mapped[Recipe] = relationship(back_populates="items")
    ingredient: Mapped[Ingredient] = relationship()


class RecipeStep(Base):
    __tablename__ = "recipe_steps"

    id: Mapped[int] = mapped_column(primary_key=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"), index=True)
    idx: Mapped[int] = mapped_column(Integer)
    text: Mapped[str] = mapped_column(Text)
    seconds: Mapped[int] = mapped_column(Integer, default=0)

    recipe: Mapped[Recipe] = relationship(back_populates="steps")


class SavedRecipe(Base):
    __tablename__ = "saved_recipes"
    __table_args__ = (UniqueConstraint("user_id", "recipe_id"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    recipe_id: Mapped[int] = mapped_column(ForeignKey("recipes.id"))
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class CartItem(Base):
    __tablename__ = "cart_items"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    name: Mapped[str] = mapped_column(String(80))
    qty: Mapped[float] = mapped_column(Float, default=1)
    unit: Mapped[str] = mapped_column(String(20), default="pcs")
    price: Mapped[int] = mapped_column(Integer, default=0)
    category: Mapped[str] = mapped_column(String(20), default="Bumbu")
    done: Mapped[bool] = mapped_column(Boolean, default=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Expense(Base):
    __tablename__ = "expenses"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    amount: Mapped[int] = mapped_column(Integer)
    budget: Mapped[int] = mapped_column(Integer)  # daily budget at the time, for "hemat" stats
    recipe_id: Mapped[int | None] = mapped_column(ForeignKey("recipes.id"))
    note: Mapped[str] = mapped_column(String(120), default="")
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Post(Base):
    __tablename__ = "posts"

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    author_name: Mapped[str] = mapped_column(String(80))
    campus: Mapped[str] = mapped_column(String(80), default="")
    type: Mapped[str] = mapped_column(String(20))  # Resep | Info Warung | Trik Masak
    recipe_id: Mapped[int | None] = mapped_column(ForeignKey("recipes.id"))
    image_url: Mapped[str | None] = mapped_column(Text)  # path, or a data: URL on serverless
    cost: Mapped[int | None] = mapped_column(Integer)
    title: Mapped[str] = mapped_column(String(160))
    body: Mapped[str] = mapped_column(Text, default="")
    location: Mapped[str | None] = mapped_column(String(160))
    cook_time: Mapped[str | None] = mapped_column(String(40))
    per_portion: Mapped[str | None] = mapped_column(String(40))
    base_likes: Mapped[int] = mapped_column(Integer, default=0)  # seed popularity
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class PostReaction(Base):
    """A like or a bookmark of a post."""

    __tablename__ = "post_reactions"
    __table_args__ = (UniqueConstraint("user_id", "post_id", "kind"),)

    id: Mapped[int] = mapped_column(primary_key=True)
    user_id: Mapped[int] = mapped_column(ForeignKey("users.id"), index=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), index=True)
    kind: Mapped[str] = mapped_column(String(8))  # like | save


class Comment(Base):
    __tablename__ = "comments"

    id: Mapped[int] = mapped_column(primary_key=True)
    post_id: Mapped[int] = mapped_column(ForeignKey("posts.id"), index=True)
    user_id: Mapped[int | None] = mapped_column(ForeignKey("users.id"))
    author_name: Mapped[str] = mapped_column(String(80))
    text: Mapped[str] = mapped_column(Text)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=now_utc)


class Spot(Base):
    __tablename__ = "spots"

    id: Mapped[int] = mapped_column(primary_key=True)
    name: Mapped[str] = mapped_column(String(120))
    distance: Mapped[str] = mapped_column(String(20))
    open_from: Mapped[str] = mapped_column(String(5))  # "06:00"
    open_to: Mapped[str] = mapped_column(String(5))  # "21:00"
    price: Mapped[int] = mapped_column(Integer)
    rating: Mapped[float] = mapped_column(Float)
    tags: Mapped[list] = mapped_column(JSON, default=list)  # Nasi | Sayur | Protein
    city: Mapped[str] = mapped_column(String(60), default="Depok")
