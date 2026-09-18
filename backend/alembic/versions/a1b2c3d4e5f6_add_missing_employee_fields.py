"""Add missing employee fields (emp_code, salary, bank, mol, eid, uid, health_card, system_password)

Revision ID: a1b2c3d4e5f6
Revises: 0e75aa46d910
Create Date: 2026-09-16 11:00:00.000000

"""
from typing import Sequence, Union

from alembic import op
import sqlalchemy as sa


# revision identifiers, used by Alembic.
revision: str = 'a1b2c3d4e5f6'
down_revision: Union[str, Sequence[str], None] = '1bc8c312ff81'
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    """Add the extended employee columns that were missing from the initial migration."""
    with op.batch_alter_table('employees', schema=None) as batch_op:
        batch_op.add_column(sa.Column('emp_code', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('salary_category', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('salary_transfer_status', sa.Boolean(), nullable=True))
        batch_op.add_column(sa.Column('health_card_no', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('bank_name', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('bank_ac', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('routing_no', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('company_mol_id', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('emp_mol_id', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('eid_no', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('uid_no', sa.String(), nullable=True))
        batch_op.add_column(sa.Column('system_password', sa.String(), nullable=True))
        batch_op.create_index('ix_employees_emp_code', ['emp_code'], unique=False)


def downgrade() -> None:
    """Remove the extended employee columns."""
    with op.batch_alter_table('employees', schema=None) as batch_op:
        batch_op.drop_index('ix_employees_emp_code')
        batch_op.drop_column('system_password')
        batch_op.drop_column('uid_no')
        batch_op.drop_column('eid_no')
        batch_op.drop_column('emp_mol_id')
        batch_op.drop_column('company_mol_id')
        batch_op.drop_column('routing_no')
        batch_op.drop_column('bank_ac')
        batch_op.drop_column('bank_name')
        batch_op.drop_column('health_card_no')
        batch_op.drop_column('salary_transfer_status')
        batch_op.drop_column('salary_category')
        batch_op.drop_column('emp_code')
