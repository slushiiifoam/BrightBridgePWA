// Debug script - add this temporarily to test Supabase connection
// Run this in browser console (F12) on your app page

// Test 1: Check if Supabase is loaded
console.log('Supabase loaded:', typeof window.supabase !== 'undefined');

// Test 2: Check if MoodTracker exists
console.log('MoodTracker exists:', typeof window.MoodTracker !== 'undefined');

// Test 3: Check current user
console.log('Current user:', window.Auth ? window.Auth.getUser() : 'Auth not loaded');

// Test 4: Test Supabase connection
async function testSupabase() {
    try {
        const { data, error } = await supabase.from('moods').select('*').limit(1);
        console.log('Supabase connection test:', { data, error });
    } catch (err) {
        console.error('Supabase test failed:', err);
    }
}
testSupabase();

// Test 5: Test mood save directly
async function testMoodSave() {
    try {
        const result = await MoodTracker.saveMood('test-happy');
        console.log('Mood save test result:', result);
    } catch (err) {
        console.error('Mood save test failed:', err);
    }
}
// Uncomment to test: testMoodSave();