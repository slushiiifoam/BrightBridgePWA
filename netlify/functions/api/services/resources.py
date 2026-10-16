from fastapi import HTTPException, status
from pydantic import BaseModel

"""
Class for managing resources
"""
class Resource_Service:
    """
    Constructor for taking in resource, admin, and editor databases
    """
    def __init__(self, db):
        self.db = db

    """
    Function for getting resourcs from the resources_db
    """
    def get_resources(self, body):
        query = body["query"]

        if query:
            return self.db.search("resources")

        return self.db.search(table="resources", column="title", value=query)

    """
    Function for verifying user privileges. If user doesn't have admin or editor privileges, then raise error
    """
    def _verify_user_privilege(self, user_uuid):
        user_is_admin = self.db.search("admin", column="uuid", value=user_uuid)
        user_is_editor = self.db.search("editor", column="uuid", value=user_uuid)

        if not user_is_admin and not user_is_editor:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="user is not authorized")
        
    """
    Function for updating/inserting resources from resources_db
    """
    def upsert_resource(self, user_uuid, contents):
        self._verify_user_privilege(user_uuid)
        result = self.db.upsert(table="resources", updated_data=contents)
        return result

    """
    Function for removing resources from resources db
    """
    def remove_resource(self, user_uuid, resource_id):
        self._verify_user_privilege(user_uuid)
        result = self.db.delete(table="resources", column="id", value=resource_id)
        return result
