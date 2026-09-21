"""
Class for managing resources
"""
class Resource_Service:
    """
    Constructor for taking in resource, admin, and editor databases
    """
    def __init__(self, resource_db, admin_db, editor_db):
        self.resource_db = resource_db
        self.admin_db = admin_db
        self.editor_db = editor_db

    