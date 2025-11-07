-- Create campaigns/ads table for vendors to submit creative ads
CREATE TABLE public.campaigns (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  partner_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT NOT NULL,
  description TEXT,
  image_url TEXT NOT NULL,
  link_url TEXT,
  start_date TIMESTAMP WITH TIME ZONE NOT NULL,
  end_date TIMESTAMP WITH TIME ZONE NOT NULL,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected', 'active', 'expired')),
  approved_by UUID REFERENCES auth.users(id),
  approved_at TIMESTAMP WITH TIME ZONE,
  rejection_reason TEXT,
  impressions INTEGER DEFAULT 0,
  clicks INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;

-- Partners can view their own campaigns
CREATE POLICY "Partners can view their own campaigns"
ON public.campaigns
FOR SELECT
USING (auth.uid() = partner_id);

-- Partners can insert their own campaigns
CREATE POLICY "Partners can insert their own campaigns"
ON public.campaigns
FOR INSERT
WITH CHECK (auth.uid() = partner_id);

-- Partners can update their own pending campaigns
CREATE POLICY "Partners can update their own pending campaigns"
ON public.campaigns
FOR UPDATE
USING (auth.uid() = partner_id AND status = 'pending');

-- Partners can delete their own pending campaigns
CREATE POLICY "Partners can delete their own pending campaigns"
ON public.campaigns
FOR DELETE
USING (auth.uid() = partner_id AND status = 'pending');

-- Admins can manage all campaigns
CREATE POLICY "Admins can manage all campaigns"
ON public.campaigns
FOR ALL
USING (has_role(auth.uid(), 'admin'::app_role));

-- Public can view approved/active campaigns (for app)
CREATE POLICY "Public can view active campaigns"
ON public.campaigns
FOR SELECT
USING (status IN ('approved', 'active'));

-- Trigger to update updated_at
CREATE TRIGGER update_campaigns_updated_at
BEFORE UPDATE ON public.campaigns
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();