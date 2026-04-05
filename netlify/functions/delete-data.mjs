import { getStore } from "@netlify/blobs";

export default async (req, context) => {
  // Only allow DELETE requests
  if (req.method !== 'DELETE') {
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

    // Parse request body
    const body = await req.json();
    const { itemId, userId } = body;

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
    
    // Get existing data
    let userData = [];
    try {
      const existingData = await store.get(userKey, { type: 'json' });
      if (existingData) {
        userData = existingData;
      }
    } catch (error) {
      // No existing data
      return new Response(JSON.stringify({ 
        error: 'Item not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Filter out the item to delete
    const filteredData = userData.filter(item => item.id !== itemId);

    // Check if item was found
    if (filteredData.length === userData.length) {
      return new Response(JSON.stringify({ 
        error: 'Item not found' 
      }), {
        status: 404,
        headers: { 'Content-Type': 'application/json' }
      });
    }

    // Save updated data
    await store.setJSON(userKey, filteredData);

    return new Response(JSON.stringify({ 
      success: true,
      message: 'Item deleted successfully'
    }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' }
    });

  } catch (error) {
    console.error('Error in delete-data function:', error);
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
  path: "/delete-data"
};