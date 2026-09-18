"""Add asset_document lifecycle fields (6-step Document Control Process)

Adds is_current, superseded_by_id, created_at, updated_at to asset_documents.
These columns power the full Record→Upload→Monitor→Alert→Renew→Update lifecycle.

Revision ID: c9d1e2f3a4b5
Revises: b3c4d5e6f7a8
Create Date: 2026-09-17

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'c9d1e2f3a4b5'
down_revision: Union[str, Sequence[str], None] = 'b3c4d5e6f7a8'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # batch_alter_table is required for SQLite schema changes (recreates table).
    # We intentionally add superseded_by_id as a plain Integer (no FK constraint
    # object) because SQLite batch-alter doesn't support named inline FK constraints.
    # The ORM relationship on the model handles the logical link correctly.
    with op.batch_alter_table('asset_documents', schema=None) as batch_op:
        # Step 5 & 6: is_current marks the live document for a vehicle+type pair.
        # server_default=1 so all existing rows become 'current' after migration.
        batch_op.add_column(sa.Column(
            'is_current',
            sa.Boolean(),
            nullable=False,
            server_default=sa.text('1'),
        ))
        # Step 6: self-referential link — old doc points to its replacement.
        batch_op.add_column(sa.Column(
            'superseded_by_id',
            sa.Integer(),
            nullable=True,
        ))
        # Audit timestamps
        batch_op.add_column(sa.Column(
            'created_at',
            sa.DateTime(timezone=True),
            server_default=sa.text('(CURRENT_TIMESTAMP)'),
            nullable=True,
        ))
        batch_op.add_column(sa.Column(
            'updated_at',
            sa.DateTime(timezone=True),
            nullable=True,
        ))

    # Index is_current for fast "give me only live docs" queries
    op.create_index(
        'ix_asset_documents_is_current',
        'asset_documents',
        ['is_current'],
        unique=False,
    )


def downgrade() -> None:
    op.drop_index('ix_asset_documents_is_current', table_name='asset_documents')
    with op.batch_alter_table('asset_documents', schema=None) as batch_op:
        batch_op.drop_column('updated_at')
        batch_op.drop_column('created_at')
        batch_op.drop_column('superseded_by_id')
        batch_op.drop_column('is_current')
