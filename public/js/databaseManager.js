import { createClient} from '@supabase/supabase-js'

const SUPABASE_URL = "https://pyqznelkiujkmviedlha.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_TqBEuyZvC51pHJDVXAGk3Q_FigwHhN3"

//class for managing the database
const db = {

    // Create a single supabase client for interacting with your database
    supabase : createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    ),

    //this function inserts a user into the database
    //updated database. it should be emails just to make everything easier
    insertUser : async function(email) {
        const { data, error } = await this.supabase
        .from("users")
        .insert({ name: email })
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