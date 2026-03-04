/* public/js/auth.js */
import { supabase } from "./supabase.js";

const Auth = {
  user: null,

  async init() {
    // read current session
    const { data: { session } } = await supabase.auth.getSession();
    this.user = session?.user ?? null;

    supabase.auth.onAuthStateChange((event, session) => {
      this.user = session?.user ?? null;
      this.onAuthChange();
    });
  },

  async signUp(email, password) {
    const { error } = await supabase.auth.signUp({ email, password });
    if (error) throw error;
  },

  async login(email, password) {
    const { error } = await supabase.auth.signInWithPassword({
      email,
      password
    });
    if (error) throw error;
  },

  async logout() {
    await supabase.auth.signOut();
  },

  onAuthChange() {
    if (window.App && typeof window.App.updateAuthUI === "function") {
      window.App.updateAuthUI();
    }
  },

  isLoggedIn() {
    return this.user !== null;
  },

  getUser() {
    return this.user;
  },

  getUserId() {
    return this.user?.id ?? null;
  },

  async getToken() {
    // Supabase stores its JWT internally; you rarely need it, but it's available
    if (!this.user) return null;
    const { data: { session } } = await supabase.auth.getSession();
    return session?.access_token ?? null;
  }
};

// initialise when DOM is ready
if (document.readyState === "loading") {
  document.addEventListener("DOMContentLoaded", () => Auth.init());
} else {
  Auth.init();
}

export default Auth;