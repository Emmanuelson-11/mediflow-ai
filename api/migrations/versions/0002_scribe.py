from alembic import op
import sqlalchemy as sa

revision = "0002_scribe"
down_revision = "0001_foundation"
branch_labels = None
depends_on = None


def upgrade() -> None:
    op.create_table(
        "transcripts",
        sa.Column("id", sa.String(40), primary_key=True),
        sa.Column("patient_id", sa.Integer(), nullable=False),
        sa.Column("patient_name", sa.String(160), nullable=False),
        sa.Column("phone", sa.String(40), nullable=False),
        sa.Column("nhis_number", sa.String(40), nullable=False),
        sa.Column("consultation_date", sa.String(20), nullable=False),
        sa.Column("clinic", sa.String(160), nullable=False),
        sa.Column("text", sa.Text(), nullable=False),
    )
    op.create_table(
        "scribe_notes",
        sa.Column("id", sa.String(40), primary_key=True),
        sa.Column("transcript_id", sa.String(40), nullable=False, unique=True),
        sa.Column("status", sa.String(40), nullable=False, server_default="none"),
        sa.Column("note_json", sa.Text(), nullable=False, server_default="{}"),
        sa.Column("generated_by", sa.String(40), nullable=False, server_default="replay"),
        sa.Column("created_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), server_default=sa.func.now(), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("scribe_notes")
    op.drop_table("transcripts")
