import { createClient} from '@supabase/supabase-js'

const SUPABASE_URL = "https://pyqznelkiujkmviedlha.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_TqBEuyZvC51pHJDVXAGk3Q_FigwHhN3"

// ─── Future Supabase Migration Notes ────────────────────────────────────────
// The app currently uses localStorage (via journal-store.js) to persist mood
// check-ins and journal entries. The keys used are:
//   • brightbridge_journal       – array of { userKey, content, mood, timestamp, date }
//   • brightbridge_mood_history  – array of { userKey, mood, timestamp, date }
//
// To migrate to Supabase-backed persistence:
//   1. Create two tables in your Supabase project:
//        journal_entries (id, user_id, content, mood, created_at)
//        mood_history    (id, user_id, mood, created_at)
//   2. Replace the readList/writeList helpers in journal-store.js with Supabase
//      .select() / .insert() / .update() calls using the `db.supabase` client
//      exported from this file.
//   3. Use Auth.getUserId() (from auth.js) as the `user_id` foreign key instead
//      of the JournalStore.resolveUserKey() local string key.
//   4. Row-Level Security (RLS) policies should restrict each user to their own
//      rows: `auth.uid() = user_id`.
//   5. Remove the brightbridge_journal and brightbridge_mood_history localStorage
//      keys once the Supabase migration is confirmed stable.
// ────────────────────────────────────────────────────────────────────────────

//class for managing the database
const db = {

    // Create a single supabase client for interacting with your database
    supabase : createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    ),

    //this function inserts a user into the database
    insertUser : async function(username) {
        const { data, error } = await this.supabase
        .from("users")
        .insert({ name: username })
        .select()

        if (error) {
        console.error("Error inserting data:", error.message)
        return error
        }

        // Use console.log for JS
        console.log("Success:", data)
        return data
    }

}

export default db