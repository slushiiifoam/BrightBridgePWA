import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // Only allow GET requests
  if (req.method !== 'GET') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), {
      status: 405,
      headers: { 'Content-Type': 'application/json' }
    });
  }

  try {
    // Verify user is authenticated
    const user = context.clientContext?.user;
    if (!user) {
      return new Response(JSON.stringify({ error: 'Unauthorized' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get userId from query params
    const url = new URL(req.url);
    const userId = url.searchParams.get('userId');

    // Verify the userId matches the authenticated user
    if (userId !== user.sub) {
      return new Response(JSON.stringify({ error: 'Forbidden' }), {
        status: 403,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Get user's blob store
    const store = getStore({ name: 'user-data', siteID: context.site.id });
    
    // Create a key for this user's data
    const userKey = `user_${userId}`;
    
    // Get user's data
    let userData = [];
    try {
      const data = await store.get(userKey, { type: 'json' });
      if (data) {
        userData = data;
      }
    } catch (error) {
      // No existing data, return empty array
      userData = [];
    }

    return new Response(JSON.stringify({ 
      items: userData 
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in get-data function:', error);
    return new Response(JSON.stringify({ 
      error: 'Internal server error',
      message: error.message 
    }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' }
    });
  }
};

export const config = {
  path: "/get-data"
};