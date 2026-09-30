from fastapi import HTTPException, status

ADMIN_TABLE = "admins"
EDITOR_TABLE = "editors"

VALID_ROLES = {"admin": ADMIN_TABLE, "editor": EDITOR_TABLE}

"""
Class for checking and managing user privileges (admin / editor status).
Both the admins and editors tables just store a `uuid` column, so
"is this user an admin?" is really "does their uuid exist in the
admins table?"
"""
class Privileges_Service:
    """
    Constructor for taking in the shared database (SupabaseRepository)
    """
    def __init__(self, db):
        self.db = db

    """
    Function for checking if a uuid exists in the admins table
    """
    def is_admin(self, uuid: str) -> bool:
        rows = self.db.search(table=ADMIN_TABLE, column="uuid", value=uuid)
        return bool(rows)

    """
    Function for checking if a uuid exists in the editors table
    """
    def is_editor(self, uuid: str) -> bool:
        rows = self.db.search(table=EDITOR_TABLE, column="uuid", value=uuid)
        return bool(rows)

    """
    Function for getting a user's role: "admin", "editor", or None
    """
    def get_role(self, uuid: str) -> str | None:
        if self.is_admin(uuid):
            return "admin"
        if self.is_editor(uuid):
            return "editor"
        return None

    """
    Function for verifying the requester is an admin. Raises 403 if not.
    (Same pattern as Resource_Service._verify_user_privilege, but only
    admins -- not editors -- are allowed to change privileges.)
    """
    def _verify_admin(self, requester_uuid: str):
        if not self.is_admin(requester_uuid):
            raise HTTPException(
                status_code=status.HTTP_403_FORBIDDEN,
                detail="Only admins can change user privileges."
            )

    """
    Function for granting a role ("admin" or "editor") to target_uuid.
    Only succeeds if requester_uuid is currently an admin.
    """
    def grant_privilege(self, requester_uuid: str, target_uuid: str, role: str) -> bool:
        if role not in VALID_ROLES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown role '{role}'.")

        self._verify_admin(requester_uuid)

        table = VALID_ROLES[role]
        return self.db.upsert(table=table, data={"uuid": target_uuid})

    """
    Function for revoking a role ("admin" or "editor") from target_uuid.
    Only succeeds if requester_uuid is currently an admin.
    """
    def revoke_privilege(self, requester_uuid: str, target_uuid: str, role: str) -> bool:
        if role not in VALID_ROLES:
            raise HTTPException(status_code=status.HTTP_400_BAD_REQUEST, detail=f"Unknown role '{role}'.")

        self._verify_admin(requester_uuid)

        table = VALID_ROLES[role]
        return self.db.remove(table=table, column="uuid", value=target_uuid)
