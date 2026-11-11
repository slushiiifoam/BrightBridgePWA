export class JournalService {
  /**
   * @param {import('../repositories/SupabaseRepository.js').SupabaseRepository} supabaseRepo
   */
  constructor(supabaseRepo) {
    this.repo = supabaseRepo;
    this.table = 'journals';
  }

  /**
   * Create a new journal entry
   */
  async createJournal(data) {
    const payload = {
      uuid: crypto.randomUUID(),
      created_date: data.created_date,
      overall_emotion: data.overall_emotion ?? null,
      entry: data.entry ?? null,
    };

    const success = await this.repo.insert(this.table, payload);
    if (!success) {
      throw new Error('Failed to insert journal entry');
    }
    return payload;
  }

  /**
   * Get all journal entries
   */
  async getAllJournals(limit = 50) {
    return await this.repo.search(this.table, '*', null, null, limit);
  }

  /**
   * Get a single journal entry by its UUID
   */
  async getJournalByUuid(uuid) {
    const results = await this.repo.search(this.table, '*', 'uuid', uuid, 1);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Update a journal entry by its UUID
   */
  async updateJournal(uuid, updateData) {
    const success = await this.repo.update(this.table, 'uuid', uuid, updateData);
    if (!success) {
      return null;
    }
    // Return the updated state
    return await this.getJournalByUuid(uuid);
  }

  /**
   * Delete a journal entry by its UUID
   */
  async deleteJournal(uuid) {
    return await this.repo.remove(this.table, 'uuid', uuid);
  }
}