import os
from dotenv import load_dotenv
from infrastructure.supabase_repository import SupabaseRepository
from services.privileges import Privileges_Service

load_dotenv()

url = os.environ.get("SUPABASE_URL")
key = os.environ.get("SUPABASE_KEY")

db = SupabaseRepository(url, key)
privileges = Privileges_Service(db)

# --- Fill these in with two REAL uuids from your users table ---
ADMIN_UUID = "061a9691-993c-4d02-866a-42909dc3c2e9"    # this one will be made an admin
TARGET_UUID = "004283e5-3530-47ae-8c5f-e2f84f0b2315"   # this one will be granted/revoked

print("Step 1: making ADMIN_UUID an actual admin (setup)...")
db.insert("admins", {"uuid": ADMIN_UUID})

print("\nStep 2: is_admin check...")
print("ADMIN_UUID is_admin:", privileges.is_admin(ADMIN_UUID))
print("TARGET_UUID is_admin (should be False):", privileges.is_admin(TARGET_UUID))

print("\nStep 3: get_role check...")
print("ADMIN_UUID role:", privileges.get_role(ADMIN_UUID))
print("TARGET_UUID role (should be None):", privileges.get_role(TARGET_UUID))

print("\nStep 4: granting 'editor' to TARGET_UUID (requester = ADMIN_UUID)...")
granted = privileges.grant_privilege(ADMIN_UUID, TARGET_UUID, "editor")
print("Grant result:", granted)
print("TARGET_UUID role now:", privileges.get_role(TARGET_UUID))

print("\nStep 5: revoking 'editor' from TARGET_UUID...")
revoked = privileges.revoke_privilege(ADMIN_UUID, TARGET_UUID, "editor")
print("Revoke result:", revoked)
print("TARGET_UUID role now (should be None again):", privileges.get_role(TARGET_UUID))

print("\nStep 6: confirming a NON-admin can't grant privileges...")
try:
    privileges.grant_privilege(TARGET_UUID, ADMIN_UUID, "admin")
    print("ERROR: this should have been blocked, but it wasn't!")
except Exception as e:
    print("Correctly blocked:", type(e).__name__, "-", getattr(e, "detail", str(e)))

print("\nStep 7: cleanup - removing ADMIN_UUID from admins table...")
db.remove("admins", "uuid", ADMIN_UUID)
print("Cleanup done.")
