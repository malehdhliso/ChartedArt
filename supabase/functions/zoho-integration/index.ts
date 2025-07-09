import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
  'Access-Control-Allow-Methods': 'POST, OPTIONS',
};

interface ZohoTokenResponse {
  access_token: string;
  expires_in: number;
}

interface CreateItemRequest {
  action: 'createItem';
  data: {
    name: string;
    sku: string;
    rate: number;
  };
}

interface CreateSalesOrderRequest {
  action: 'createSalesOrder';
  data: {
    customer_name: string;
    line_items: Array<{
      item_id: string;
      rate: number;
      quantity: number;
    }>;
    shipping_address: {
      address: string;
      city: string;
      state: string;
      zip: string;
      country: string;
    };
  };
}

type ZohoRequest = CreateItemRequest | CreateSalesOrderRequest;

async function getZohoAccessToken(): Promise<string> {
  const clientId = Deno.env.get('ZOHO_CLIENT_ID');
  const clientSecret = Deno.env.get('ZOHO_CLIENT_SECRET');
  const refreshToken = Deno.env.get('ZOHO_REFRESH_TOKEN');

  if (!clientId || !clientSecret || !refreshToken) {
    throw new Error('Missing Zoho credentials in environment variables');
  }

  const tokenUrl = 'https://accounts.zoho.com/oauth/v2/token';
  const params = new URLSearchParams({
    refresh_token: refreshToken,
    client_id: clientId,
    client_secret: clientSecret,
    grant_type: 'refresh_token',
  });

  const response = await fetch(tokenUrl, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/x-www-form-urlencoded',
    },
    body: params.toString(),
  });

  if (!response.ok) {
    throw new Error(`Failed to get Zoho access token: ${response.statusText}`);
  }

  const tokenData: ZohoTokenResponse = await response.json();
  return tokenData.access_token;
}

async function createZohoItem(accessToken: string, itemData: CreateItemRequest['data']) {
  const organizationId = Deno.env.get('ZOHO_ORGANIZATION_ID');
  
  if (!organizationId) {
    throw new Error('Missing Zoho organization ID in environment variables');
  }

  const apiUrl = `https://www.zohoapis.com/inventory/v1/items?organization_id=${organizationId}`;
  
  const requestBody = {
    name: itemData.name,
    sku: itemData.sku,
    rate: itemData.rate,
    account_id: Deno.env.get('ZOHO_SALES_ACCOUNT_ID'), // Sales account ID from Zoho
    tax_id: Deno.env.get('ZOHO_TAX_ID'), // Tax ID from Zoho (VAT)
    item_type: 'inventory',
    product_type: 'goods',
    is_taxable: true,
    tax_percentage: 15, // South African VAT rate
  };

  const response = await fetch(apiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(requestBody),
  });

  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Failed to create Zoho item: ${response.statusText} - ${errorText}`);
  }

  return await response.json();
}

async function createZohoSalesOrder(accessToken: string, orderData: CreateSalesOrderRequest['data']) {
  const organizationId = Deno.env.get('ZOHO_ORGANIZATION_ID');
  
  if (!organizationId) {
    throw new Error('Missing Zoho organization ID in environment variables');
  }

  // First, create or get customer
  const customerApiUrl = `https://www.zohoapis.com/inventory/v1/contacts?organization_id=${organizationId}`;
  
  const customerBody = {
    contact_name: orderData.customer_name,
    contact_type: 'customer',
    billing_address: {
      address: orderData.shipping_address.address,
      city: orderData.shipping_address.city,
      state: orderData.shipping_address.state,
      zip: orderData.shipping_address.zip,
      country: orderData.shipping_address.country,
    },
    shipping_address: {
      address: orderData.shipping_address.address,
      city: orderData.shipping_address.city,
      state: orderData.shipping_address.state,
      zip: orderData.shipping_address.zip,
      country: orderData.shipping_address.country,
    },
  };

  const customerResponse = await fetch(customerApiUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(customerBody),
  });

  let customerId;
  if (customerResponse.ok) {
    const customerData = await customerResponse.json();
    customerId = customerData.contact.contact_id;
  } else {
    // If customer creation fails, try to find existing customer
    const searchUrl = `https://www.zohoapis.com/inventory/v1/contacts?organization_id=${organizationId}&contact_name=${encodeURIComponent(orderData.customer_name)}`;
    const searchResponse = await fetch(searchUrl, {
      headers: {
        'Authorization': `Zoho-oauthtoken ${accessToken}`,
      },
    });
    
    if (searchResponse.ok) {
      const searchData = await searchResponse.json();
      if (searchData.contacts && searchData.contacts.length > 0) {
        customerId = searchData.contacts[0].contact_id;
      } else {
        throw new Error('Failed to create or find customer in Zoho');
      }
    } else {
      throw new Error('Failed to create or find customer in Zoho');
    }
  }

  // Create sales order
  const salesOrderUrl = `https://www.zohoapis.com/inventory/v1/salesorders?organization_id=${organizationId}`;
  
  const salesOrderBody = {
    customer_id: customerId,
    date: new Date().toISOString().split('T')[0], // Today's date in YYYY-MM-DD format
    shipment_date: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString().split('T')[0], // 7 days from now
    line_items: orderData.line_items.map(item => ({
      item_id: item.item_id,
      rate: item.rate,
      quantity: item.quantity,
    })),
    shipping_address: {
      address: orderData.shipping_address.address,
      city: orderData.shipping_address.city,
      state: orderData.shipping_address.state,
      zip: orderData.shipping_address.zip,
      country: orderData.shipping_address.country,
    },
  };

  const salesOrderResponse = await fetch(salesOrderUrl, {
    method: 'POST',
    headers: {
      'Authorization': `Zoho-oauthtoken ${accessToken}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(salesOrderBody),
  });

  if (!salesOrderResponse.ok) {
    const errorText = await salesOrderResponse.text();
    throw new Error(`Failed to create Zoho sales order: ${salesOrderResponse.statusText} - ${errorText}`);
  }

  return await salesOrderResponse.json();
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    const requestData: ZohoRequest = await req.json();
    
    // Get Zoho access token
    const accessToken = await getZohoAccessToken();
    
    let result;
    
    switch (requestData.action) {
      case 'createItem':
        result = await createZohoItem(accessToken, requestData.data);
        break;
        
      case 'createSalesOrder':
        result = await createZohoSalesOrder(accessToken, requestData.data);
        break;
        
      default:
        throw new Error(`Unknown action: ${(requestData as any).action}`);
    }

    return new Response(
      JSON.stringify({ success: true, data: result }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Zoho integration error:', error);
    
    return new Response(
      JSON.stringify({ 
        success: false, 
        error: error instanceof Error ? error.message : 'Unknown error occurred' 
      }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});