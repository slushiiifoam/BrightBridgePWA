import db from '/js/db.js';

// AdminManager module for role promotion/demotion and role checks against admins/editors tables.
//this is the sub class that is going to manage the admin and editors systems
//the prototypes will receive methods from their parents similar to inheritence in java or c++
const adminManager = {
    ...db,

    //the function that allows the users to add someone as an admin
    //the suer can be inserted into either the user or admin table
    promoteUser : async function(database, email){
        if(database != "admins" && database != "editors")
            return {error : "use admins or editors as the database"};

        const user = await this.getUserId(email);

        try{

            if(user.error || !user.data)
                throw new Error('There is an error with fetching the user!');

            //inserts the new user as an admin
            const admin = await this.insertData(database, { id: user.data.id });

            if(admin.error)
                throw new Error('There is an error with promoting the user!');

            return admin.data;

        }catch(error){
            console.log(error);
            return { error: error.message };
        } 
    },

    //this fucntion demotes the user and removes their privileges
    demoteUser : async function(database, email){
        if(database != "admins" && database != "editors")
            return {error : "use admins or editors as the database"};

        const user = await this.getUserId(email);

        try{
            if(user.error || !user.data)
                throw new Error('There is an error with fetching the user!');

            const {data, error} = await this.supabase.from(database)
                .delete()
                .eq("id", user.data.id)
                .select();

            if(error)
                throw new Error('There is an error with removing the user');

            return data;

        }catch(error){
            console.log(error);
            return { error: error.message };
        }
    },

    //the function that gets checks if the user is an admin or editor
    checkUser : async function(database, id){
        if(database != "admins" && database != "editors")
            return {error : "use admins or editors as the database"};

        const {data, error} = await db.supabase
            .from(database)
            .select()
            .eq("id", id)
            .maybeSingle();

        return data && !error;
    },

};

export default adminManager;
