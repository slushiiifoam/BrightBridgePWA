from supabase import create_client, Client

"""
Wrapper class for supabase 
"""
class SupabaseRepository:
    """
    Constructor
    Parms: url (str), key (str)
    """
    def __init__(self, url: str, key: str) -> None:
        self.client: Client = create_client(url, key)

    """
    Function for read operations in the database
    Params: table (str), fields (str), column (str), value (str | num), limit (num)
    Returns: list[dict]
    """
    def search(self, table: str, fields = "*" , column = None, value = None, limit=50):
        """Find rows where `column` equals `value` in `table`."""
        if column is None or value is None:
            return self.client.table(table).select(fields).limit(limit).execute()

        response = self.client.table(table).select(fields).eq(column, value).limit(limit).execute()
        return response.data

    """
    Function for removing elements from database
    Params: table (str), column (str), value (str)
    Returns: bool
    """
    def remove(self, table: str, column: str, value: str) -> bool:
        """Delete rows where `column` equals `value` in `table`."""
        response = self.client.table(table).delete().eq(column, value).execute()
        return len(response.data) > 0

    """
    Function for updating elements
    Params: table (str), column (str), value (str), update_data (dict)
    Returns: bool 
    """
    def update(self, table: str, column: str, value: str, update_data: dict) -> bool:
        """Update rows where `column` equals `value`, setting new values from `update_data`."""
        response = self.client.table(table).update(update_data).eq(column, value).execute()
        return len(response.data) > 0

    """
    Function for inserting elements
    """
    def insert(self, table: str, data: dict) -> bool:
        """Insert a new row into `table`."""
        response = self.client.table(table).insert(data).execute()
        return len(response.data) > 0

    """
    Function for upserting elements 
    """
    def upsert(self, table: str, data: dict, onConflict : str = None) -> bool:
        """Insert a new row, or update it if a matching row already exists."""

        if onConflict is not None:
            response = self.client.table(table).upsert(data, on_conflict=onConflict).execute()
            return len(response.data) > 0

        response = self.client.table(table).upsert(data).execute()
        return len(response.data) > 0