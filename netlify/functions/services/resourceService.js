/**
 * Service class for managing resource link operations in Supabase
 */
export class ResourceService {
  /**
   * Constructor for taking in database repository
   * @param {import('../repositories/supabaseRepository.js').SupabaseRepository} db 
   */
  constructor(db) {
    this.db = db;
    this.table = 'resource_links';
  }

  /**
   * Function for getting resources from the database
   * @param {object} body - Request payload or query params object
   * @param {string} [body.query] - Search term for filtering by title
   * @returns {Promise<Array<object>>}
   */
  async getResources(body = {}) {
    const query = body?.query;

    if (!query) {
      return await this.db.search(this.table);
    }

    return await this.db.search(this.table, '*', 'title', query);
  }

  /**
   * Internal method for verifying user privileges.
   * Throws an error if user lacks admin or editor privileges.
   * @param {string} userUuid 
   */
  async _verifyUserPrivilege(userUuid) {
    const userIsAdmin = await this.db.search('admin', '*', 'uuid', userUuid);
    const userIsEditor = await this.db.search('editor', '*', 'uuid', userUuid);

    const isAdmin = Array.isArray(userIsAdmin) && userIsAdmin.length > 0;
    const isEditor = Array.isArray(userIsEditor) && userIsEditor.length > 0;

    if (!isAdmin && !isEditor) {
      const error = new Error('user is not authorized');
      error.statusCode = 401;
      throw error;
    }
  }

  /**
   * Function for updating/inserting resources
   * @param {string} userUuid 
   * @param {object|Array<object>} contents 
   * @returns {Promise<boolean>}
   */
  async upsertResource(userUuid, contents) {
    // await this._verifyUserPrivilege(userUuid);
    const result = await this.db.upsert(this.table, contents);
    return result;
  }

  /**
   * Function for removing resources from database
   * @param {string} userUuid 
   * @param {string|number} resourceId 
   * @returns {Promise<boolean>}
   */
  async removeResource(userUuid, resourceId) {
    // await this._verifyUserPrivilege(userUuid);
    const result = await this.db.remove(this.table, 'id', resourceId);
    return result;
  }
}