from supabase import create_client, Client


class SupabaseRepository:
    def __init__(self, url: str, key: str):
        self.client: Client = create_client(url, key)

    def search(self, table: str, column: str, value: str):
        """Find rows where `column` equals `value` in `table`."""
        response = self.client.table(table).select("*").eq(column, value).execute()
        return response.data

    def remove(self, table: str, column: str, value: str) -> bool:
        """Delete rows where `column` equals `value` in `table`."""
        response = self.client.table(table).delete().eq(column, value).execute()
        return len(response.data) > 0

    def update(self, table: str, column: str, value: str, update_data: dict) -> bool:
        """Update rows where `column` equals `value`, setting new values from `update_data`."""
        response = self.client.table(table).update(update_data).eq(column, value).execute()
        return len(response.data) > 0

    def insert(self, table: str, data: dict) -> bool:
        """Insert a new row into `table`."""
        response = self.client.table(table).insert(data).execute()
        return len(response.data) > 0

    def upsert(self, table: str, data: dict) -> bool:
        """Insert a new row, or update it if a matching row already exists."""
        response = self.client.table(table).upsert(data).execute()
        return len(response.data) > 0
