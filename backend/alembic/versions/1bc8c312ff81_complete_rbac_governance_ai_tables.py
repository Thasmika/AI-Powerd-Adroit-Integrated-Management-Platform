"""complete_rbac_governance_ai_tables

Revision ID: 1bc8c312ff81
Revises: 0e75aa46d910
Create Date: 2026-09-16 09:52:24.686997

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = '1bc8c312ff81'
down_revision: Union[str, Sequence[str], None] = '0e75aa46d910'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def _table_exists(conn, table_name: str) -> bool:
    result = conn.execute(sa.text(
        "SELECT name FROM sqlite_master WHERE type='table' AND name=:t"
    ), {"t": table_name})
    return result.fetchone() is not None


def _column_exists(conn, table_name: str, column_name: str) -> bool:
    result = conn.execute(sa.text(f"PRAGMA table_info({table_name})"))
    return any(row[1] == column_name for row in result.fetchall())


def _index_exists(conn, index_name: str) -> bool:
    result = conn.execute(sa.text(
        "SELECT name FROM sqlite_master WHERE type='index' AND name=:i"
    ), {"i": index_name})
    return result.fetchone() is not None


def upgrade() -> None:
    """Upgrade schema — idempotent (safe to re-run after partial failure)."""
    conn = op.get_bind()

    # ── asset_categories ──────────────────────────────────────────────────────
    if not _table_exists(conn, 'asset_categories'):
        op.create_table('asset_categories',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('code', sa.String(), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('code'),
        )
    if not _index_exists(conn, 'ix_asset_categories_id'):
        op.create_index(op.f('ix_asset_categories_id'), 'asset_categories', ['id'], unique=False)
    if not _index_exists(conn, 'ix_asset_categories_name'):
        op.create_index(op.f('ix_asset_categories_name'), 'asset_categories', ['name'], unique=True)

    # ── leave_types ───────────────────────────────────────────────────────────
    if not _table_exists(conn, 'leave_types'):
        op.create_table('leave_types',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('code', sa.String(), nullable=False),
            sa.Column('max_days_per_year', sa.Integer(), nullable=True),
            sa.Column('requires_document', sa.Boolean(), nullable=True),
            sa.Column('is_active', sa.Boolean(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('code'),
        )
    if not _index_exists(conn, 'ix_leave_types_id'):
        op.create_index(op.f('ix_leave_types_id'), 'leave_types', ['id'], unique=False)
    if not _index_exists(conn, 'ix_leave_types_name'):
        op.create_index(op.f('ix_leave_types_name'), 'leave_types', ['name'], unique=True)

    # ── permissions ───────────────────────────────────────────────────────────
    if not _table_exists(conn, 'permissions'):
        op.create_table('permissions',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('name', sa.String(), nullable=False),
            sa.Column('description', sa.String(), nullable=True),
            sa.Column('module', sa.String(), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False),
            sa.PrimaryKeyConstraint('id'),
        )
    if not _index_exists(conn, 'ix_permissions_id'):
        op.create_index(op.f('ix_permissions_id'), 'permissions', ['id'], unique=False)
    if not _index_exists(conn, 'ix_permissions_module'):
        op.create_index(op.f('ix_permissions_module'), 'permissions', ['module'], unique=False)
    if not _index_exists(conn, 'ix_permissions_name'):
        op.create_index(op.f('ix_permissions_name'), 'permissions', ['name'], unique=True)

    # ── ai_interactions ───────────────────────────────────────────────────────
    if not _table_exists(conn, 'ai_interactions'):
        op.create_table('ai_interactions',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=True),
            sa.Column('session_id', sa.String(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
            sa.Column('module', sa.String(), nullable=False),
            sa.Column('entity_type', sa.String(), nullable=True),
            sa.Column('entity_id', sa.Integer(), nullable=True),
            sa.Column('prompt', sa.Text(), nullable=False),
            sa.Column('response', sa.Text(), nullable=True),
            sa.Column('model_used', sa.String(), nullable=True),
            sa.Column('prompt_tokens', sa.Integer(), nullable=True),
            sa.Column('completion_tokens', sa.Integer(), nullable=True),
            sa.Column('latency_ms', sa.Float(), nullable=True),
            sa.Column('success', sa.Integer(), nullable=False),
            sa.Column('error_message', sa.Text(), nullable=True),
            sa.ForeignKeyConstraint(['user_id'], ['users.id']),
            sa.PrimaryKeyConstraint('id'),
        )
    if not _index_exists(conn, 'ix_ai_interactions_created_at'):
        op.create_index(op.f('ix_ai_interactions_created_at'), 'ai_interactions', ['created_at'], unique=False)
    if not _index_exists(conn, 'ix_ai_interactions_id'):
        op.create_index(op.f('ix_ai_interactions_id'), 'ai_interactions', ['id'], unique=False)
    if not _index_exists(conn, 'ix_ai_interactions_module'):
        op.create_index(op.f('ix_ai_interactions_module'), 'ai_interactions', ['module'], unique=False)
    if not _index_exists(conn, 'ix_ai_interactions_session_id'):
        op.create_index(op.f('ix_ai_interactions_session_id'), 'ai_interactions', ['session_id'], unique=False)
    if not _index_exists(conn, 'ix_ai_interactions_user_id'):
        op.create_index(op.f('ix_ai_interactions_user_id'), 'ai_interactions', ['user_id'], unique=False)

    # ── role_permissions ──────────────────────────────────────────────────────
    if not _table_exists(conn, 'role_permissions'):
        op.create_table('role_permissions',
            sa.Column('role_id', sa.Integer(), nullable=False),
            sa.Column('permission_id', sa.Integer(), nullable=False),
            sa.ForeignKeyConstraint(['permission_id'], ['permissions.id'], ondelete='CASCADE'),
            sa.ForeignKeyConstraint(['role_id'], ['roles.id'], ondelete='CASCADE'),
            sa.UniqueConstraint('role_id', 'permission_id', name='uq_role_permission'),
        )

    # ── responsible_officer_rules ─────────────────────────────────────────────
    if not _table_exists(conn, 'responsible_officer_rules'):
        op.create_table('responsible_officer_rules',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('document_type_id', sa.Integer(), nullable=False),
            sa.Column('module', sa.String(), nullable=False),
            sa.Column('company_id', sa.Integer(), nullable=True),
            sa.Column('department_id', sa.Integer(), nullable=True),
            sa.Column('assigned_user_id', sa.Integer(), nullable=False),
            sa.Column('priority', sa.Integer(), nullable=False),
            sa.Column('is_active', sa.Boolean(), nullable=False),
            sa.ForeignKeyConstraint(['assigned_user_id'], ['users.id']),
            sa.ForeignKeyConstraint(['company_id'], ['companies.id']),
            sa.ForeignKeyConstraint(['department_id'], ['departments.id']),
            sa.ForeignKeyConstraint(['document_type_id'], ['document_types.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('document_type_id', 'module', 'company_id', 'department_id', name='uq_officer_rule_scope'),
        )
    if not _index_exists(conn, 'ix_responsible_officer_rules_document_type_id'):
        op.create_index(op.f('ix_responsible_officer_rules_document_type_id'), 'responsible_officer_rules', ['document_type_id'], unique=False)
    if not _index_exists(conn, 'ix_responsible_officer_rules_id'):
        op.create_index(op.f('ix_responsible_officer_rules_id'), 'responsible_officer_rules', ['id'], unique=False)

    # ── user_scopes ───────────────────────────────────────────────────────────
    if not _table_exists(conn, 'user_scopes'):
        op.create_table('user_scopes',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('user_id', sa.Integer(), nullable=False),
            sa.Column('scope_type', sa.String(), nullable=False),
            sa.Column('company_id', sa.Integer(), nullable=True),
            sa.Column('department_id', sa.Integer(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=True),
            sa.ForeignKeyConstraint(['company_id'], ['companies.id']),
            sa.ForeignKeyConstraint(['department_id'], ['departments.id']),
            sa.ForeignKeyConstraint(['user_id'], ['users.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
            sa.UniqueConstraint('user_id', 'scope_type', 'company_id', 'department_id', name='uq_user_scope'),
        )
    if not _index_exists(conn, 'ix_user_scopes_id'):
        op.create_index(op.f('ix_user_scopes_id'), 'user_scopes', ['id'], unique=False)
    if not _index_exists(conn, 'ix_user_scopes_user_id'):
        op.create_index(op.f('ix_user_scopes_user_id'), 'user_scopes', ['user_id'], unique=False)

    # ── leave_events ──────────────────────────────────────────────────────────
    if not _table_exists(conn, 'leave_events'):
        op.create_table('leave_events',
            sa.Column('id', sa.Integer(), nullable=False),
            sa.Column('leave_request_id', sa.Integer(), nullable=False),
            sa.Column('event_type', sa.String(), nullable=False),
            sa.Column('actor_id', sa.Integer(), nullable=True),
            sa.Column('notes', sa.Text(), nullable=True),
            sa.Column('created_at', sa.DateTime(timezone=True), server_default=sa.text('(CURRENT_TIMESTAMP)'), nullable=False),
            sa.ForeignKeyConstraint(['actor_id'], ['users.id']),
            sa.ForeignKeyConstraint(['leave_request_id'], ['leave_requests.id'], ondelete='CASCADE'),
            sa.PrimaryKeyConstraint('id'),
        )
    if not _index_exists(conn, 'ix_leave_events_event_type'):
        op.create_index(op.f('ix_leave_events_event_type'), 'leave_events', ['event_type'], unique=False)
    if not _index_exists(conn, 'ix_leave_events_id'):
        op.create_index(op.f('ix_leave_events_id'), 'leave_events', ['id'], unique=False)
    if not _index_exists(conn, 'ix_leave_events_leave_request_id'):
        op.create_index(op.f('ix_leave_events_leave_request_id'), 'leave_events', ['leave_request_id'], unique=False)

    # ── Column additions ──────────────────────────────────────────────────────
    if not _column_exists(conn, 'assets', 'category_id'):
        op.add_column('assets', sa.Column('category_id', sa.Integer(), nullable=True))
    if not _index_exists(conn, 'ix_assets_category_id'):
        op.create_index(op.f('ix_assets_category_id'), 'assets', ['category_id'], unique=False)

    if not _column_exists(conn, 'leave_requests', 'leave_type_id'):
        op.add_column('leave_requests', sa.Column('leave_type_id', sa.Integer(), nullable=True))
    if not _index_exists(conn, 'ix_leave_requests_leave_type_id'):
        op.create_index(op.f('ix_leave_requests_leave_type_id'), 'leave_requests', ['leave_type_id'], unique=False)

    if not _column_exists(conn, 'users', 'created_at'):
        # SQLite cannot ADD COLUMN with a non-constant default (e.g. CURRENT_TIMESTAMP).
        # Add the column without a default, then back-fill existing rows.
        op.add_column('users', sa.Column('created_at', sa.DateTime(timezone=True), nullable=True))
        conn.execute(sa.text("UPDATE users SET created_at = CURRENT_TIMESTAMP WHERE created_at IS NULL"))
    if not _column_exists(conn, 'users', 'last_login_at'):
        op.add_column('users', sa.Column('last_login_at', sa.DateTime(timezone=True), nullable=True))




def downgrade() -> None:
    """Downgrade schema."""
    # ### commands auto generated by Alembic - please adjusted for SQLite compatibility ###
    op.drop_column('users', 'last_login_at')
    op.drop_column('users', 'created_at')
    op.drop_index(op.f('ix_leave_requests_leave_type_id'), table_name='leave_requests')
    op.drop_column('leave_requests', 'leave_type_id')
    op.drop_index(op.f('ix_assets_category_id'), table_name='assets')
    op.drop_column('assets', 'category_id')
    op.drop_index(op.f('ix_leave_events_leave_request_id'), table_name='leave_events')
    op.drop_index(op.f('ix_leave_events_id'), table_name='leave_events')
    op.drop_index(op.f('ix_leave_events_event_type'), table_name='leave_events')
    op.drop_table('leave_events')
    op.drop_index(op.f('ix_user_scopes_user_id'), table_name='user_scopes')
    op.drop_index(op.f('ix_user_scopes_id'), table_name='user_scopes')
    op.drop_table('user_scopes')
    op.drop_index(op.f('ix_responsible_officer_rules_id'), table_name='responsible_officer_rules')
    op.drop_index(op.f('ix_responsible_officer_rules_document_type_id'), table_name='responsible_officer_rules')
    op.drop_table('responsible_officer_rules')
    op.drop_table('role_permissions')
    op.drop_index(op.f('ix_ai_interactions_user_id'), table_name='ai_interactions')
    op.drop_index(op.f('ix_ai_interactions_session_id'), table_name='ai_interactions')
    op.drop_index(op.f('ix_ai_interactions_module'), table_name='ai_interactions')
    op.drop_index(op.f('ix_ai_interactions_id'), table_name='ai_interactions')
    op.drop_index(op.f('ix_ai_interactions_created_at'), table_name='ai_interactions')
    op.drop_table('ai_interactions')
    op.drop_index(op.f('ix_permissions_name'), table_name='permissions')
    op.drop_index(op.f('ix_permissions_module'), table_name='permissions')
    op.drop_index(op.f('ix_permissions_id'), table_name='permissions')
    op.drop_table('permissions')
    op.drop_index(op.f('ix_leave_types_name'), table_name='leave_types')
    op.drop_index(op.f('ix_leave_types_id'), table_name='leave_types')
    op.drop_table('leave_types')
    op.drop_index(op.f('ix_asset_categories_name'), table_name='asset_categories')
    op.drop_index(op.f('ix_asset_categories_id'), table_name='asset_categories')
    op.drop_table('asset_categories')
    # ### end Alembic commands ###
