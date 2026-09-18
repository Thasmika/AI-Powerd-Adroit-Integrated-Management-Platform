"""Add asset metrics

Revision ID: b3c4d5e6f7a8
Revises: a2384713ed72
Create Date: 2026-09-17 12:45:00.000000

Adds four operational metric columns to the assets table:
  - total_mileage       (INTEGER, km driven)
  - fuel_efficiency     (FLOAT,   L/100km)
  - next_service_mileage (INTEGER, km at next scheduled service)
  - engine_hours        (INTEGER, cumulative engine-on hours)

All columns are nullable so existing rows are unaffected.
"""
from typing import Sequence, Union

import sqlalchemy as sa
from alembic import op


# revision identifiers, used by Alembic.
revision: str = 'b3c4d5e6f7a8'
down_revision: Union[str, Sequence[str], None] = 'a2384713ed72'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add metric columns to the assets table."""
    # SQLite does not support adding multiple columns in one ALTER TABLE
    # statement, so each column is added individually.
    op.add_column('assets', sa.Column('total_mileage', sa.Integer(), nullable=True))
    op.add_column('assets', sa.Column('fuel_efficiency', sa.Float(), nullable=True))
    op.add_column('assets', sa.Column('next_service_mileage', sa.Integer(), nullable=True))
    op.add_column('assets', sa.Column('engine_hours', sa.Integer(), nullable=True))


def downgrade() -> None:
    """Remove metric columns from the assets table.

    Note: SQLite does not natively support DROP COLUMN in older versions.
    This downgrade uses the recommended batch-mode approach for SQLite
    compatibility (Alembic recreates the table without the columns).
    """
    with op.batch_alter_table('assets') as batch_op:
        batch_op.drop_column('engine_hours')
        batch_op.drop_column('next_service_mileage')
        batch_op.drop_column('fuel_efficiency')
        batch_op.drop_column('total_mileage')
