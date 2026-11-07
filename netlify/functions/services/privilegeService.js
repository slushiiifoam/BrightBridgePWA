const ADMIN_TABLE = 'admins';
const EDITOR_TABLE = 'editors';

const VALID_ROLES = {
  admin: ADMIN_TABLE,
  editor: EDITOR_TABLE,
};

/**
 * Class for checking and managing user privileges (admin / editor status).
 */
export class PrivilegesService {
  /**
   * Constructor for taking in the shared database (SupabaseRepository)
   * @param {import('../repositories/supabaseRepository.js').SupabaseRepository} db 
   */
  constructor(db) {
    this.db = db;
  }

  /**
   * Function for checking if a uuid exists in the admins table
   * @param {string} uuid 
   * @returns {Promise<boolean>}
   */
  async isAdmin(uuid) {
    const rows = await this.db.search(ADMIN_TABLE, '*', 'uuid', uuid);
    return Array.isArray(rows) && rows.length > 0;
  }

  /**
   * Function for checking if a uuid exists in the editors table
   * @param {string} uuid 
   * @returns {Promise<boolean>}
   */
  async isEditor(uuid) {
    const rows = await this.db.search(EDITOR_TABLE, '*', 'uuid', uuid);
    return Array.isArray(rows) && rows.length > 0;
  }

  /**
   * Function for getting a user's role: "admin", "editor", or null
   * @param {string} uuid 
   * @returns {Promise<string|null>}
   */
  async getRole(uuid) {
    if (await this.isAdmin(uuid)) {
      return 'admin';
    }
    if (await this.isEditor(uuid)) {
      return 'editor';
    }
    return null;
  }

  /**
   * Internal function for verifying the requester is an admin.
   * Throws a 403 HTTP error if not.
   * @param {string} requesterUuid 
   */
  async _verifyAdmin(requesterUuid) {
    const adminStatus = await this.isAdmin(requesterUuid);
    if (!adminStatus) {
      const error = new Error('Only admins can change user privileges.');
      error.statusCode = 403;
      throw error;
    }
  }

  /**
   * Function for granting a role ("admin" or "editor") to targetUuid.
   * Only succeeds if requesterUuid is currently an admin.
   * @param {string} requesterUuid 
   * @param {string} targetUuid 
   * @param {string} role 
   * @returns {Promise<boolean>}
   */
  async grantPrivilege(requesterUuid, targetUuid, role) {
    if (!VALID_ROLES[role]) {
      const error = new Error(`Unknown role '${role}'.`);
      error.statusCode = 400;
      throw error;
    }

    await this._verifyAdmin(requesterUuid);

    const table = VALID_ROLES[role];
    return await this.db.upsert(table, { uuid: targetUuid });
  }

  /**
   * Function for revoking a role ("admin" or "editor") from targetUuid.
   * Only succeeds if requesterUuid is currently an admin.
   * @param {string} requesterUuid 
   * @param {string} targetUuid 
   * @param {string} role 
   * @returns {Promise<boolean>}
   */
  async revokePrivilege(requesterUuid, targetUuid, role) {
    if (!VALID_ROLES[role]) {
      const error = new Error(`Unknown role '${role}'.`);
      error.statusCode = 400;
      throw error;
    }

    await this._verifyAdmin(requesterUuid);

    const table = VALID_ROLES[role];
    return await this.db.remove(table, 'uuid', targetUuid);
  }
}