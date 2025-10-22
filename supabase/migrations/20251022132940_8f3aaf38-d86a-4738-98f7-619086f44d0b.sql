-- Add approval fields to products table
ALTER TABLE public.products 
ADD COLUMN approved_at timestamp with time zone,
ADD COLUMN approved_by uuid REFERENCES auth.users(id),
ADD COLUMN rejection_reason text;

-- Update product status to include pending_approval
COMMENT ON COLUMN public.products.status IS 'Product status: active, inactive, pending (pending approval)';

-- Create stock_movements table for tracking inventory changes
CREATE TABLE public.stock_movements (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id uuid NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  quantity integer NOT NULL,
  movement_type text NOT NULL, -- 'sale', 'erp_sync', 'manual_adjustment', 'return'
  reference_id text, -- order_id or ERP transaction ID
  previous_stock integer NOT NULL,
  new_stock integer NOT NULL,
  notes text,
  created_at timestamp with time zone DEFAULT now(),
  created_by uuid REFERENCES auth.users(id)
);

ALTER TABLE public.stock_movements ENABLE ROW LEVEL SECURITY;

-- RLS policies for stock_movements
CREATE POLICY "Admins can view all stock movements"
ON public.stock_movements
FOR SELECT
USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Partners can view their products stock movements"
ON public.stock_movements
FOR SELECT
USING (
  EXISTS (
    SELECT 1 FROM public.products
    WHERE products.id = stock_movements.product_id
    AND products.partner_id = auth.uid()
  )
);

CREATE POLICY "System can insert stock movements"
ON public.stock_movements
FOR INSERT
WITH CHECK (true);

-- Update orders table to link with partners
ALTER TABLE public.orders
ADD COLUMN partner_id uuid REFERENCES auth.users(id),
ADD COLUMN erp_reference text,
ADD COLUMN notes text;

-- Add RLS policy for partners to view their orders
CREATE POLICY "Partners can view their orders"
ON public.orders
FOR SELECT
USING (auth.uid() = partner_id);

-- Create function to update stock and record movement
CREATE OR REPLACE FUNCTION public.update_product_stock(
  _product_id uuid,
  _quantity_change integer,
  _movement_type text,
  _reference_id text DEFAULT NULL,
  _notes text DEFAULT NULL,
  _user_id uuid DEFAULT NULL
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _previous_stock integer;
  _new_stock integer;
  _movement_id uuid;
BEGIN
  -- Get current stock
  SELECT stock INTO _previous_stock
  FROM public.products
  WHERE id = _product_id
  FOR UPDATE;

  IF _previous_stock IS NULL THEN
    RAISE EXCEPTION 'Product not found';
  END IF;

  -- Calculate new stock
  _new_stock := _previous_stock + _quantity_change;

  IF _new_stock < 0 THEN
    RAISE EXCEPTION 'Insufficient stock';
  END IF;

  -- Update product stock
  UPDATE public.products
  SET stock = _new_stock,
      updated_at = now()
  WHERE id = _product_id;

  -- Record movement
  INSERT INTO public.stock_movements (
    product_id,
    quantity,
    movement_type,
    reference_id,
    previous_stock,
    new_stock,
    notes,
    created_by
  )
  VALUES (
    _product_id,
    _quantity_change,
    _movement_type,
    _reference_id,
    _previous_stock,
    _new_stock,
    _notes,
    _user_id
  )
  RETURNING id INTO _movement_id;

  RETURN jsonb_build_object(
    'success', true,
    'previous_stock', _previous_stock,
    'new_stock', _new_stock,
    'movement_id', _movement_id
  );
END;
$$;

-- Create function to approve product
CREATE OR REPLACE FUNCTION public.approve_product(
  _product_id uuid,
  _admin_id uuid
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT has_role(_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can approve products';
  END IF;

  -- Update product
  UPDATE public.products
  SET status = 'active',
      approved_at = now(),
      approved_by = _admin_id,
      rejection_reason = NULL,
      updated_at = now()
  WHERE id = _product_id;

  RETURN jsonb_build_object('success', true);
END;
$$;

-- Create function to reject product
CREATE OR REPLACE FUNCTION public.reject_product(
  _product_id uuid,
  _admin_id uuid,
  _reason text
)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT has_role(_admin_id, 'admin'::app_role) THEN
    RAISE EXCEPTION 'Only admins can reject products';
  END IF;

  -- Update product
  UPDATE public.products
  SET status = 'inactive',
      rejection_reason = _reason,
      updated_at = now()
  WHERE id = _product_id;

  RETURN jsonb_build_object('success', true);
END;
$$;