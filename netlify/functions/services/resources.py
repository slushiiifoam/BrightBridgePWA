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
        self.table = "resource_links"

    """
    Function for getting resourcs from the resources_db
    """
    def get_resources(self, body):
        query = body["query"]

        if not query:
            return self.db.search(self.table)

        return self.db.search(table=self.table, column="title", value=query)

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
        #self._verify_user_privilege(user_uuid)
        result = self.db.upsert(table=self.table, data=contents)
        return result

    """
    Function for removing resources from resources db
    """
    def remove_resource(self, user_uuid, resource_id):
        #self._verify_user_privilege(user_uuid)
        result = self.db.remove(table=self.table, column="id", value=resource_id)
        return result
