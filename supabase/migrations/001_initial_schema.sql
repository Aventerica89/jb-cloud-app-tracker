-- Enable UUID extension
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Enum types
CREATE TYPE app_status AS ENUM ('active', 'inactive', 'archived', 'maintenance');
CREATE TYPE deployment_status AS ENUM ('pending', 'building', 'deployed', 'failed', 'rolled_back');

-- Environments (shared across all users)
CREATE TABLE environments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    name TEXT NOT NULL UNIQUE,
    slug TEXT NOT NULL UNIQUE,
    sort_order INT DEFAULT 0
);

-- Seed default environments
INSERT INTO environments (name, slug, sort_order) VALUES
    ('Development', 'development', 1),
    ('Staging', 'staging', 2),
    ('Production', 'production', 3);

-- Cloud Providers (user-owned)
CREATE TABLE cloud_providers (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    slug TEXT NOT NULL,
    icon_name TEXT,
    base_url TEXT,
    is_active BOOLEAN DEFAULT true,
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, slug)
);

-- Tags (user-owned)
CREATE TABLE tags (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    color TEXT DEFAULT '#3b82f6',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    UNIQUE(user_id, name)
);

-- Applications (user-owned)
CREATE TABLE applications (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    description TEXT,
    repository_url TEXT,
    tech_stack TEXT[] DEFAULT '{}',
    status app_status DEFAULT 'active',
    created_at TIMESTAMPTZ DEFAULT NOW(),
    updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Application Tags (junction table)
CREATE TABLE application_tags (
    application_id UUID REFERENCES applications(id) ON DELETE CASCADE,
    tag_id UUID REFERENCES tags(id) ON DELETE CASCADE,
    PRIMARY KEY (application_id, tag_id)
);

-- Deployments
CREATE TABLE deployments (
    id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    application_id UUID NOT NULL REFERENCES applications(id) ON DELETE CASCADE,
    provider_id UUID NOT NULL REFERENCES cloud_providers(id) ON DELETE RESTRICT,
    environment_id UUID NOT NULL REFERENCES environments(id) ON DELETE RESTRICT,
    url TEXT,
    branch TEXT,
    commit_sha TEXT,
    status deployment_status DEFAULT 'deployed',
    deployed_at TIMESTAMPTZ DEFAULT NOW(),
    created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Indexes for performance
CREATE INDEX idx_applications_user_id ON applications(user_id);
CREATE INDEX idx_applications_status ON applications(status);
CREATE INDEX idx_deployments_application_id ON deployments(application_id);
CREATE INDEX idx_deployments_provider_id ON deployments(provider_id);
CREATE INDEX idx_deployments_environment_id ON deployments(environment_id);
CREATE INDEX idx_deployments_deployed_at ON deployments(deployed_at DESC);
CREATE INDEX idx_cloud_providers_user_id ON cloud_providers(user_id);
CREATE INDEX idx_tags_user_id ON tags(user_id);

-- Updated_at trigger for applications
CREATE OR REPLACE FUNCTION update_updated_at()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER applications_updated_at
    BEFORE UPDATE ON applications
    FOR EACH ROW
    EXECUTE FUNCTION update_updated_at();

-- Function to seed default providers on user signup
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
        (NEW.id, 'Render', 'render', 'server', 'https://render.com');
    RETURN NEW;
END;
$$;

-- Set proper ownership
ALTER FUNCTION public.seed_user_providers() OWNER TO postgres;

-- Trigger to seed providers when a new user signs up
CREATE TRIGGER on_auth_user_created
    AFTER INSERT ON auth.users
    FOR EACH ROW
    EXECUTE FUNCTION public.seed_user_providers();

-- Row Level Security (RLS)
ALTER TABLE cloud_providers ENABLE ROW LEVEL SECURITY;
ALTER TABLE applications ENABLE ROW LEVEL SECURITY;
ALTER TABLE deployments ENABLE ROW LEVEL SECURITY;
ALTER TABLE tags ENABLE ROW LEVEL SECURITY;
ALTER TABLE application_tags ENABLE ROW LEVEL SECURITY;

-- Cloud Providers policies
CREATE POLICY "Users can view own providers"
    ON cloud_providers FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own providers"
    ON cloud_providers FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own providers"
    ON cloud_providers FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own providers"
    ON cloud_providers FOR DELETE
    USING (auth.uid() = user_id);

-- Applications policies
CREATE POLICY "Users can view own applications"
    ON applications FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own applications"
    ON applications FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own applications"
    ON applications FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own applications"
    ON applications FOR DELETE
    USING (auth.uid() = user_id);

-- Deployments policies
CREATE POLICY "Users can view own deployments"
    ON deployments FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM applications
            WHERE applications.id = deployments.application_id
            AND applications.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own deployments"
    ON deployments FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM applications
            WHERE applications.id = deployments.application_id
            AND applications.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can update own deployments"
    ON deployments FOR UPDATE
    USING (
        EXISTS (
            SELECT 1 FROM applications
            WHERE applications.id = deployments.application_id
            AND applications.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own deployments"
    ON deployments FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM applications
            WHERE applications.id = deployments.application_id
            AND applications.user_id = auth.uid()
        )
    );

-- Tags policies
CREATE POLICY "Users can view own tags"
    ON tags FOR SELECT
    USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own tags"
    ON tags FOR INSERT
    WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own tags"
    ON tags FOR UPDATE
    USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own tags"
    ON tags FOR DELETE
    USING (auth.uid() = user_id);

-- Application Tags policies
CREATE POLICY "Users can view own application tags"
    ON application_tags FOR SELECT
    USING (
        EXISTS (
            SELECT 1 FROM applications
            WHERE applications.id = application_tags.application_id
            AND applications.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can insert own application tags"
    ON application_tags FOR INSERT
    WITH CHECK (
        EXISTS (
            SELECT 1 FROM applications
            WHERE applications.id = application_tags.application_id
            AND applications.user_id = auth.uid()
        )
    );

CREATE POLICY "Users can delete own application tags"
    ON application_tags FOR DELETE
    USING (
        EXISTS (
            SELECT 1 FROM applications
            WHERE applications.id = application_tags.application_id
            AND applications.user_id = auth.uid()
        )
    );

-- Environments are public read (no RLS, just grant SELECT)
GRANT SELECT ON environments TO authenticated;
GRANT SELECT ON environments TO anon;
