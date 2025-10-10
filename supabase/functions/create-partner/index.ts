import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.38.4'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface CreatePartnerRequest {
  name: string
  email: string
  company: string
  password: string
  plan: 'turbo' | 'v6' | 'v12'
}

const PLANS = {
  turbo: { price: 99.90 },
  v6: { price: 249.90 },
  v12: { price: 499.90 },
}

Deno.serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    // Create Supabase client with service role key for admin operations
    const supabaseAdmin = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? '',
      {
        auth: {
          autoRefreshToken: false,
          persistSession: false
        }
      }
    )

    // Verify the requesting user is an admin
    const authHeader = req.headers.get('Authorization')
    if (!authHeader) {
      throw new Error('No authorization header')
    }

    const token = authHeader.replace('Bearer ', '')
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token)
    
    if (userError || !user) {
      throw new Error('Unauthorized')
    }

    // Check if user is admin
    const { data: roleData, error: roleError } = await supabaseAdmin
      .from('user_roles')
      .select('role')
      .eq('user_id', user.id)
      .single()

    if (roleError || roleData?.role !== 'admin') {
      throw new Error('Only admins can create partners')
    }

    // Parse request body
    const body: CreatePartnerRequest = await req.json()
    console.log('Creating partner:', { email: body.email, plan: body.plan })

    // 1. Create auth user
    const { data: authData, error: authError } = await supabaseAdmin.auth.admin.createUser({
      email: body.email,
      password: body.password,
      email_confirm: true,
      user_metadata: {
        name: body.name,
      }
    })

    if (authError) {
      console.error('Auth error:', authError)
      throw authError
    }

    if (!authData.user) {
      throw new Error('Failed to create user')
    }

    console.log('User created:', authData.user.id)

    // 2. Update profile with company
    const { error: profileError } = await supabaseAdmin
      .from('profiles')
      .update({ 
        name: body.name,
        company: body.company 
      })
      .eq('id', authData.user.id)

    if (profileError) {
      console.error('Profile error:', profileError)
      throw profileError
    }

    console.log('Profile updated')

    // 3. Add partner role
    const { error: roleInsertError } = await supabaseAdmin
      .from('user_roles')
      .insert({ 
        user_id: authData.user.id, 
        role: 'partner' 
      })

    if (roleInsertError) {
      console.error('Role error:', roleInsertError)
      throw roleInsertError
    }

    console.log('Role assigned')

    // 4. Create subscription
    const plan = PLANS[body.plan]
    const renewalDate = new Date()
    renewalDate.setFullYear(renewalDate.getFullYear() + 1)

    const { error: subscriptionError } = await supabaseAdmin
      .from('partner_subscriptions')
      .insert({
        partner_id: authData.user.id,
        plan: body.plan,
        status: 'active',
        renewal_date: renewalDate.toISOString(),
        monthly_revenue: plan.price,
        products_count: 0,
        users_count: 1,
      })

    if (subscriptionError) {
      console.error('Subscription error:', subscriptionError)
      throw subscriptionError
    }

    console.log('Subscription created')

    return new Response(
      JSON.stringify({
        success: true,
        partner: {
          id: authData.user.id,
          email: authData.user.email,
          name: body.name,
          company: body.company,
          plan: body.plan,
        }
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      },
    )
  } catch (error) {
    console.error('Error creating partner:', error)
    return new Response(
      JSON.stringify({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error',
      }),
      {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      },
    )
  }
})
