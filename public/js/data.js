/* public/js/data.js */
import Auth from "./auth.js";
import { supabase } from "./supabase.js";

const Data = {
  async saveItem(content) {
    const userId = Auth.getUserId();
    if (!userId) throw new Error("not authenticated");

    const { data, error } = await supabase
      .from("items")
      .insert([{ content, user_id: userId, timestamp: new Date() }]);

    if (error) throw error;
    return data;
  },

  async loadItems() {
    const userId = Auth.getUserId();
    if (!userId) throw new Error("not authenticated");

    const { data, error } = await supabase
      .from("items")
      .select("*")
      .eq("user_id", userId);

    if (error) throw error;
    return data;
  },

  async deleteItem(itemId) {
    const userId = Auth.getUserId();
    if (!userId) throw new Error("not authenticated");

    const { error } = await supabase
      .from("items")
      .delete()
      .eq("id", itemId)
      .eq("user_id", userId);

    if (error) throw error;
    return true;
  }
};

export default Data;