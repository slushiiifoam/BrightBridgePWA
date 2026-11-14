export class JournalService {
  /**
   * @param {import('../repositories/SupabaseRepository.js').SupabaseRepository} supabaseRepo
   */
  constructor(supabaseRepo) {
    this.repo = supabaseRepo;
    this.table = 'journal_entry';
  }

  /**
   * Create a new journal entry
   */
  async upsertJournal(data) {
    const payload = {
      uuid: data.uuid,
      created_date: data.created_date,
      overall_emotion: data.overall_emotion ?? null,
      entry: data.entry ?? null,
    };

    const success = await this.repo.upsert(this.table, payload);

    if (!success) {
      throw new Error('Failed to insert journal entry');
    }
    return payload;
  }

  /**
   * Get a single journal entry by its UUID
   */
  async getJournalByUuid(uuid, limit=1) {
    const results = await this.repo.search(this.table, '*', 'uuid', uuid, limit);
    return results.length > 0 ? results[0] : null;
  }

  /**
   * Delete a journal entry by its UUID
   */
  async deleteJournal(uuid) {
    return await this.repo.remove(this.table, 'uuid', uuid);
  }
}