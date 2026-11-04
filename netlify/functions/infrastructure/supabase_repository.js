import { createClient } from '@supabase/supabase-js';

/**
 * Wrapper class for Supabase database operations
 */
export class SupabaseRepository {
  /**
   * Constructor
   * @param {string} url 
   * @param {string} key 
   */
  constructor(url, key) {
    this.client = createClient(url, key);
  }

  /**
   * Function for read operations in the database
   * @param {string} table 
   * @param {string} [fields='*'] 
   * @param {string|null} [column=null] 
   * @param {string|number|null} [value=null] 
   * @param {number} [limit=50] 
   * @returns {Promise<Array<object>>}
   */
  async search(table, fields = '*', column = null, value = null, limit = 50) {
    let query = this.client.from(table).select(fields).limit(limit);

    if (column !== null && value !== null) {
      query = query.eq(column, value);
    }

    const { data, error } = await query;
    if (error) throw error;

    return data ?? [];
  }

  /**
   * Function for removing elements from database
   * @param {string} table 
   * @param {string} column 
   * @param {string|number} value 
   * @returns {Promise<boolean>}
   */
  async remove(table, column, value) {
    const { data, error } = await this.client
      .from(table)
      .delete()
      .eq(column, value)
      .select(); // select() forces Supabase JS to return deleted rows in data array

    if (error) throw error;

    return Boolean(data && data.length > 0);
  }

  /**
   * Function for updating elements
   * @param {string} table 
   * @param {string} column 
   * @param {string|number} value 
   * @param {object} updateData 
   * @returns {Promise<boolean>}
   */
  async update(table, column, value, updateData) {
    const { data, error } = await this.client
      .from(table)
      .update(updateData)
      .eq(column, value)
      .select();

    if (error) throw error;

    return Boolean(data && data.length > 0);
  }

  /**
   * Function for inserting elements
   * @param {string} table 
   * @param {object|Array<object>} data 
   * @returns {Promise<boolean>}
   */
  async insert(table, data) {
    const { data: insertedData, error } = await this.client
      .from(table)
      .insert(data)
      .select();

    if (error) throw error;

    return Boolean(insertedData && insertedData.length > 0);
  }

  /**
   * Function for upserting elements
   * @param {string} table 
   * @param {object|Array<object>} data 
   * @param {string|null} [onConflict=null] 
   * @returns {Promise<boolean>}
   */
  async upsert(table, data, onConflict = null) {
    const options = onConflict ? { onConflict } : {};

    const { data: upsertedData, error } = await this.client
      .from(table)
      .upsert(data, options)
      .select();

    if (error) throw error;

    return Boolean(upsertedData && upsertedData.length > 0);
  }
};