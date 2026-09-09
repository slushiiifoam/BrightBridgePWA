import { createClient} from '@supabase/supabase-js'

const SUPABASE_URL = "https://pyqznelkiujkmviedlha.supabase.co"
const SUPABASE_ANON_KEY = "sb_publishable_TqBEuyZvC51pHJDVXAGk3Q_FigwHhN3"

//class for managing the database
const db = {

    //date attribute for future operations
    today : new Date(),

    // Create a single supabase client for interacting with your database
    supabase : createClient(
        SUPABASE_URL,
        SUPABASE_ANON_KEY
    ),

    //this function gets the user information based on their email
    getUserId: async function(email){
        return { data, error} = await db.supabase
                    .from('users')
                    .select('id')
                    .eq('email', email)
                    .single();
    },

    //inserts specific data into a database of your choice 
    insertData : async function(database, data){
        return { data, error } = await db.supabase
                    .from(database)
                    .insert(data);
    },

}

export default db