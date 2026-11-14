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
  async getJournalByUuid(uuid) {
    const results = await this.repo.search(this.table, '*', 'uuid', uuid);
    return results;
  }

  async getTodayJournal(data){
    const uuid = data.uuid;
    const date = data.created_date;

    const results = await this.repo.client.from(this.table).eq('uuid', uuid).eq('created_date', date);
    return results;
  }

  /**
   * Delete a journal entry by its UUID
   */
  async deleteJournal(uuid, date) {
    return await this.repo.client.from(this.table).eq('uuid', uuid).eq('created_date', date);
  }
}