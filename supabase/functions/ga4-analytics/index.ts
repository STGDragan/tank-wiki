import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { create, getNumericDate, Header, Payload } from "https://deno.land/x/djwt@v3.0.1/mod.ts";
import { crypto } from "https://deno.land/std@0.190.0/crypto/mod.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Get service account credentials from Supabase secrets
const getServiceAccountCredentials = () => {
  const privateKey = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PRIVATE_KEY');
  const clientEmail = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_CLIENT_EMAIL');
  const projectId = Deno.env.get('GOOGLE_SERVICE_ACCOUNT_PROJECT_ID');
  
  if (!privateKey || !clientEmail || !projectId) {
    throw new Error('Missing required Google service account credentials in environment variables');
  }
  
  return {
    private_key: privateKey.replace(/\\n/g, '\n'), // Handle escaped newlines
    client_email: clientEmail,
    project_id: projectId
  };
};

const GA4_PROPERTY_ID = "456709306"; // TODO: Update this with the correct property ID from G-JRMD62DTMJ

async function createJWTToken(): Promise<string> {
  const serviceAccount = getServiceAccountCredentials();
  const scope = 'https://www.googleapis.com/auth/analytics.readonly';
  const aud = 'https://oauth2.googleapis.com/token';
  
  const header: Header = {
    alg: "RS256",
    typ: "JWT"
  };
  
  const payload: Payload = {
    iss: serviceAccount.client_email,
    scope: scope,
    aud: aud,
    exp: getNumericDate(60 * 60), // 1 hour
    iat: getNumericDate(0)
  };

  // Import the private key
  const privateKeyPem = serviceAccount.private_key;
  
  // Parse the PEM format
  const pemHeader = "-----BEGIN PRIVATE KEY-----";
  const pemFooter = "-----END PRIVATE KEY-----";
  const pemContents = privateKeyPem
    .replace(pemHeader, "")
    .replace(pemFooter, "")
    .replace(/\s/g, "");
  
  const binaryDer = Uint8Array.from(atob(pemContents), c => c.charCodeAt(0));
  
  const cryptoKey = await crypto.subtle.importKey(
    "pkcs8",
    binaryDer,
    {
      name: "RSASSA-PKCS1-v1_5",
      hash: "SHA-256",
    },
    false,
    ["sign"]
  );

  return await create(header, payload, cryptoKey);
}

async function getAccessToken(): Promise<string> {
  try {
    const jwt = await createJWTToken();
    
    const response = await fetch('https://oauth2.googleapis.com/token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/x-www-form-urlencoded',
      },
      body: new URLSearchParams({
        'grant_type': 'urn:ietf:params:oauth:grant-type:jwt-bearer',
        'assertion': jwt
      })
    });
    
    if (!response.ok) {
      const error = await response.text();
      throw new Error(`Failed to get access token: ${response.status} ${error}`);
    }
    
    const tokenData = await response.json();
    return tokenData.access_token;
  } catch (error) {
    console.error('Error getting access token:', error);
    throw error;
  }
}

async function fetchGA4Data(timeRange: string, accessToken: string) {
  try {
    // Calculate date range
    const endDate = new Date();
    const startDate = new Date();
    
    switch (timeRange) {
      case '7d':
        startDate.setDate(endDate.getDate() - 7);
        break;
      case '30d':
        startDate.setDate(endDate.getDate() - 30);
        break;
      case '90d':
        startDate.setDate(endDate.getDate() - 90);
        break;
      default:
        startDate.setDate(endDate.getDate() - 7);
    }
    
    const startDateStr = startDate.toISOString().split('T')[0];
    const endDateStr = endDate.toISOString().split('T')[0];
    
    // Fetch basic metrics
    const metricsResponse = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
        metrics: [
          { name: 'totalUsers' },
          { name: 'activeUsers' },
          { name: 'screenPageViews' },
          { name: 'bounceRate' }
        ]
      })
    });
    
    if (!metricsResponse.ok) {
      throw new Error(`GA4 API error: ${metricsResponse.status}`);
    }
    
    const metricsData = await metricsResponse.json();
    console.log('GA4 metrics response:', metricsData);
    
    // Fetch traffic sources
    const sourcesResponse = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
        dimensions: [{ name: 'sessionDefaultChannelGroup' }],
        metrics: [{ name: 'sessions' }],
        orderBys: [{ metric: { metricName: 'sessions' }, desc: true }],
        limit: 10
      })
    });
    
    const sourcesData = await sourcesResponse.json();
    
    // Fetch popular pages
    const pagesResponse = await fetch(`https://analyticsdata.googleapis.com/v1beta/properties/${GA4_PROPERTY_ID}:runReport`, {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        dateRanges: [{ startDate: startDateStr, endDate: endDateStr }],
        dimensions: [{ name: 'pagePath' }],
        metrics: [{ name: 'screenPageViews' }],
        orderBys: [{ metric: { metricName: 'screenPageViews' }, desc: true }],
        limit: 10
      })
    });
    
    const pagesData = await pagesResponse.json();
    
    // Parse the data
    const metrics = metricsData.rows?.[0]?.metricValues || [];
    const totalUsers = parseInt(metrics[0]?.value || '0');
    const activeUsers = parseInt(metrics[1]?.value || '0');
    const pageViews = parseInt(metrics[2]?.value || '0');
    const bounceRate = parseFloat(metrics[3]?.value || '0') * 100;
    
    // Process traffic sources
    const trafficSources = sourcesData.rows?.map((row: any) => {
      const source = row.dimensionValues[0].value;
      const sessions = parseInt(row.metricValues[0].value);
      return { source, users: sessions, percentage: 0 }; // Calculate percentage later
    }) || [];
    
    // Calculate percentages for traffic sources
    const totalSessions = trafficSources.reduce((sum, source) => sum + source.users, 0);
    trafficSources.forEach(source => {
      source.percentage = totalSessions > 0 ? Math.round((source.users / totalSessions) * 100) : 0;
    });
    
    // Process popular pages
    const popularPages = pagesData.rows?.map((row: any) => ({
      page: row.dimensionValues[0].value,
      views: parseInt(row.metricValues[0].value),
      uniqueViews: parseInt(row.metricValues[0].value) // GA4 doesn't separate unique views easily
    })) || [];
    
    return {
      totalUsers,
      activeUsers,
      pageViews,
      uniqueVisitors: Math.floor(totalUsers * 0.8), // Estimate
      bounceRate: Math.round(bounceRate),
      trafficSources,
      popularPages,
      userGrowth: [] // Would need additional API calls for time series data
    };
  } catch (error) {
    console.error('Error fetching GA4 data:', error);
    throw error;
  }
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { timeRange = '30d' } = await req.json();
    
    console.log(`Fetching GA4 analytics data for time range: ${timeRange}`);
    
    // Get access token
    const accessToken = await getAccessToken();
    console.log('Successfully obtained access token');
    
    // Fetch analytics data
    const analyticsData = await fetchGA4Data(timeRange, accessToken);
    console.log('Successfully fetched GA4 data:', analyticsData);
    
    return new Response(JSON.stringify(analyticsData), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  } catch (error) {
    console.error('Error in ga4-analytics function:', error);
    return new Response(JSON.stringify({ 
      error: 'Failed to fetch analytics data',
      message: error.message 
    }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});