import { createClient} from '@supabase/supabase-js'

const SUPABASE_URL = 'https://pyqznelkiujkmviedlha.supabase.co';
const SUPABASE_ANON_KEY = 'sb_publishable_TqBEuyZvC51pHJDVXAGk3Q_FigwHhN3';
    
const databaseManager = {
    supabase : createClient(SUPABASE_URL, SUPABASE_ANON_KEY),

    getTodayDate() {
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    },

    async getUserByUuid(uuid) {
        const normalizedUuid = String(uuid || '').trim().toLowerCase();
        if (!normalizedUuid) {
            return { data: null, error: { message: 'UUID is required.' } };
        }

        const { data, error } = await this.supabase
            .from('users')
            .select('uuid,email')
            .eq('uuid', normalizedUuid)
            .maybeSingle();

        return { data: data || null, error };
    },

    async ensureUserByUuid(uuid, email) {
        const normalizedUuid = String(uuid || '').trim().toLowerCase();
        const normalizedEmail = String(email || '').trim().toLowerCase();

        if (!normalizedUuid) {
            return { data: null, error: { message: 'UUID is required.' } };
        }

        const found = await this.getUserByUuid(normalizedUuid);
        if (found.error) {
            return found;
        }

        if (found.data) {
            if (normalizedEmail && found.data.email !== normalizedEmail) {
                const { data, error } = await this.supabase
                    .from('users')
                    .update({ email: normalizedEmail })
                    .eq('uuid', normalizedUuid)
                    .select('uuid,email')
                    .maybeSingle();

                if (error) {
                    return { data: null, error };
                }

                return { data: data || null, error: null };
            }

            return found;
        }

        if (!normalizedEmail) {
            return { data: null, error: { message: 'Email is required when creating a new user profile.' } };
        }

        const { data, error } = await this.supabase
            .from('users')
            .insert({ uuid: normalizedUuid, email: normalizedEmail })
            .select('uuid,email')
            .maybeSingle();

        if (error) {
            if (String(error.code || '').toUpperCase() === '23505') {
                return this.getUserByUuid(normalizedUuid);
            }

            return { data: null, error };
        }

        return { data: data || null, error: null };
    },

    async getTodayEntry(uuid, createdDate) {
        const { data, error } = await this.supabase
            .from('journal_entry')
            .select('created_date,overall_emotion,entry,uuid')
            .eq('uuid', uuid)
            .eq('created_date', createdDate)
            .maybeSingle();

        return { data: data || null, error };
    },

    async upsertTodayEntry(uuid, createdDate, entryText, overallEmotion) {
        const payload = {
            uuid,
            created_date: createdDate,
            entry: entryText,
            overall_emotion: overallEmotion
        };

        const { data, error } = await this.supabase
            .from('journal_entry')
            .upsert(payload, { onConflict: 'uuid,created_date' })
            .select('created_date,overall_emotion,entry,uuid')
            .maybeSingle();

        return { data: data || null, error };
    },

    async getRecentEntries(uuid, limit) {
        const max = Number(limit) > 0 ? Number(limit) : 10;
        const { data, error } = await this.supabase
            .from('journal_entry')
            .select('created_date,overall_emotion,entry,uuid')
            .eq('uuid', uuid)
            .order('created_date', { ascending: false })
            .limit(max);

        return { data: Array.isArray(data) ? data : [], error };
    }
};

export default databaseManager