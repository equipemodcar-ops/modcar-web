-- Create products table
CREATE TABLE public.products (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  code TEXT NOT NULL,
  brand TEXT NOT NULL,
  category TEXT NOT NULL,
  description TEXT,
  technical_specs JSONB DEFAULT '{}',
  price NUMERIC(10, 2) NOT NULL,
  stock INTEGER NOT NULL DEFAULT 0,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'inactive', 'pending')),
  images TEXT[] DEFAULT '{}',
  compatibility JSONB DEFAULT '[]',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(partner_id, code)
);

-- Enable RLS
ALTER TABLE public.products ENABLE ROW LEVEL SECURITY;

-- Policies for products
CREATE POLICY "Partners can view their own products"
  ON public.products
  FOR SELECT
  USING (auth.uid() = partner_id);

CREATE POLICY "Partners can insert their own products"
  ON public.products
  FOR INSERT
  WITH CHECK (auth.uid() = partner_id);

CREATE POLICY "Partners can update their own products"
  ON public.products
  FOR UPDATE
  USING (auth.uid() = partner_id);

CREATE POLICY "Partners can delete their own products"
  ON public.products
  FOR DELETE
  USING (auth.uid() = partner_id);

CREATE POLICY "Admins can view all products"
  ON public.products
  FOR SELECT
  USING (has_role(auth.uid(), 'admin'::app_role));

CREATE POLICY "Admins can manage all products"
  ON public.products
  FOR ALL
  USING (has_role(auth.uid(), 'admin'::app_role));

-- Trigger for updated_at
CREATE TRIGGER update_products_updated_at
  BEFORE UPDATE ON public.products
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Create storage bucket for product images
INSERT INTO storage.buckets (id, name, public)
VALUES ('product-images', 'product-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies
CREATE POLICY "Public can view product images"
  ON storage.objects
  FOR SELECT
  USING (bucket_id = 'product-images');

CREATE POLICY "Partners can upload product images"
  ON storage.objects
  FOR INSERT
  WITH CHECK (
    bucket_id = 'product-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Partners can update their product images"
  ON storage.objects
  FOR UPDATE
  USING (
    bucket_id = 'product-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );

CREATE POLICY "Partners can delete their product images"
  ON storage.objects
  FOR DELETE
  USING (
    bucket_id = 'product-images' AND 
    auth.uid()::text = (storage.foldername(name))[1]
  );