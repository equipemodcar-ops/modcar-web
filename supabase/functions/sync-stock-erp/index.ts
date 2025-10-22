import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2.38.4";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

interface StockSyncRequest {
  product_code: string;
  quantity_change: number;
  erp_reference: string;
  notes?: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    const { product_code, quantity_change, erp_reference, notes }: StockSyncRequest = await req.json();

    console.log('Stock sync request:', { product_code, quantity_change, erp_reference });

    // Find product by code
    const { data: product, error: productError } = await supabase
      .from('products')
      .select('id, stock, name')
      .eq('code', product_code)
      .single();

    if (productError || !product) {
      console.error('Product not found:', productError);
      return new Response(
        JSON.stringify({ error: 'Product not found' }),
        { status: 404, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    // Update stock using the database function
    const { data: result, error: updateError } = await supabase.rpc('update_product_stock', {
      _product_id: product.id,
      _quantity_change: quantity_change,
      _movement_type: 'erp_sync',
      _reference_id: erp_reference,
      _notes: notes || `ERP sync from reference: ${erp_reference}`,
      _user_id: null,
    });

    if (updateError) {
      console.error('Error updating stock:', updateError);
      return new Response(
        JSON.stringify({ error: updateError.message }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    console.log('Stock updated successfully:', result);

    return new Response(
      JSON.stringify({
        success: true,
        product: {
          id: product.id,
          name: product.name,
          code: product_code,
        },
        stock_update: result,
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in sync-stock-erp:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});