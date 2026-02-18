-- Add GitHub as a cloud provider for existing users who don't have it yet
INSERT INTO public.cloud_providers (user_id, name, slug, icon_name, base_url)
SELECT id, 'GitHub', 'github', 'github', 'https://github.com'
FROM auth.users
WHERE id NOT IN (
    SELECT user_id FROM public.cloud_providers WHERE slug = 'github'
);

-- Update the seed trigger to include GitHub for new users
CREATE OR REPLACE FUNCTION public.seed_user_providers()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
    INSERT INTO public.cloud_providers (user_id, name, slug, icon_name, base_url) VALUES
        (NEW.id, 'Vercel', 'vercel', 'triangle', 'https://vercel.com'),
        (NEW.id, 'Cloudflare', 'cloudflare', 'cloud', 'https://cloudflare.com'),
        (NEW.id, 'Railway', 'railway', 'train-front', 'https://railway.app'),
        (NEW.id, 'AWS', 'aws', 'cloud', 'https://aws.amazon.com'),
        (NEW.id, 'Google Cloud', 'gcp', 'cloud', 'https://cloud.google.com'),
        (NEW.id, 'Netlify', 'netlify', 'hexagon', 'https://netlify.com'),
        (NEW.id, 'DigitalOcean', 'digitalocean', 'droplet', 'https://digitalocean.com'),
        (NEW.id, 'Supabase', 'supabase', 'database', 'https://supabase.com'),
        (NEW.id, 'Fly.io', 'flyio', 'plane', 'https://fly.io'),
        (NEW.id, 'Render', 'render', 'server', 'https://render.com'),
        (NEW.id, 'GitHub', 'github', 'github', 'https://github.com');
    RETURN NEW;
END;
$$;

ALTER FUNCTION public.seed_user_providers() OWNER TO postgres;
