-- Enable uuid-ossp or pgcrypto if needed
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. Profiles / Users Table
CREATE TABLE IF NOT EXISTS public.profiles (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    email TEXT UNIQUE NOT NULL,
    full_name TEXT NOT NULL,
    role TEXT NOT NULL DEFAULT 'user' CHECK (role IN ('admin', 'user')),
    plan TEXT NOT NULL DEFAULT 'pro' CHECK (plan IN ('free', 'starter', 'pro', 'enterprise')),
    credits_balance NUMERIC NOT NULL DEFAULT 1840.00,
    max_employees INT NOT NULL DEFAULT 50,
    max_phone_numbers INT NOT NULL DEFAULT 10,
    max_calls_per_month INT NOT NULL DEFAULT 10000,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'suspended')),
    phone TEXT,
    company_name TEXT DEFAULT 'Acme Corp',
    avatar_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 2. Phone Numbers Table
CREATE TABLE IF NOT EXISTS public.phone_numbers (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    phone_number TEXT UNIQUE NOT NULL,
    country TEXT NOT NULL DEFAULT 'India 🇮🇳',
    type TEXT NOT NULL DEFAULT 'Mobile' CHECK (type IN ('Local', 'Mobile', 'Toll-Free')),
    monthly_cost NUMERIC NOT NULL DEFAULT 499.00,
    status TEXT NOT NULL DEFAULT 'assigned' CHECK (status IN ('pool', 'assigned', 'released')),
    assigned_to UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    assigned_to_email TEXT,
    inbound_enabled BOOLEAN NOT NULL DEFAULT false,
    inbound_agent_id UUID,
    inbound_working_hours TEXT DEFAULT '9am-6pm',
    inbound_after_hours TEXT DEFAULT 'Voicemail',
    inbound_welcome_message TEXT DEFAULT 'Thank you for calling VoiceAI Studio. An AI specialist will assist you shortly.',
    calls_today INT NOT NULL DEFAULT 0,
    answer_rate NUMERIC NOT NULL DEFAULT 71.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 3. AI Employees Table
CREATE TABLE IF NOT EXISTS public.employees (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    language TEXT NOT NULL DEFAULT 'Hindi',
    goal TEXT NOT NULL DEFAULT 'Sales' CHECK (goal IN ('Sales', 'Support', 'Lead Qualify', 'Booking', 'Survey')),
    voice_style TEXT DEFAULT 'Polite & Energetic',
    opening_greeting TEXT NOT NULL,
    screening_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    closing_message TEXT NOT NULL,
    system_prompt TEXT,
    faq_list JSONB DEFAULT '[]'::jsonb,
    hot_rules TEXT,
    warm_rules TEXT,
    cold_rules TEXT,
    phone_number_id UUID REFERENCES public.phone_numbers(id) ON DELETE SET NULL,
    phone_number TEXT,
    status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'paused')),
    total_calls INT NOT NULL DEFAULT 0,
    hot_rate NUMERIC NOT NULL DEFAULT 0.0,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 4. Employee Templates Table (Admin Managed)
CREATE TABLE IF NOT EXISTS public.employee_templates (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    target_language TEXT NOT NULL DEFAULT 'Hindi',
    goal TEXT NOT NULL DEFAULT 'Lead Qualification',
    voice_style TEXT DEFAULT 'Warm & Engaging',
    opening_greeting TEXT NOT NULL,
    screening_questions JSONB NOT NULL DEFAULT '[]'::jsonb,
    closing_message TEXT NOT NULL,
    system_prompt TEXT,
    hot_rules TEXT,
    warm_rules TEXT,
    cold_rules TEXT,
    usage_count INT NOT NULL DEFAULT 0,
    is_published BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 5. Bulk Campaigns Table
CREATE TABLE IF NOT EXISTS public.campaigns (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    employee_name TEXT,
    caller_id_mode TEXT NOT NULL DEFAULT 'fixed' CHECK (caller_id_mode IN ('fixed', 'pool', 'per_contact')),
    caller_id_phone TEXT,
    status TEXT NOT NULL DEFAULT 'ready' CHECK (status IN ('draft', 'ready', 'running', 'paused', 'completed', 'stopped')),
    total_contacts INT NOT NULL DEFAULT 0,
    dialed_count INT NOT NULL DEFAULT 0,
    answered_count INT NOT NULL DEFAULT 0,
    hot_leads INT NOT NULL DEFAULT 0,
    warm_leads INT NOT NULL DEFAULT 0,
    cold_leads INT NOT NULL DEFAULT 0,
    max_retry INT NOT NULL DEFAULT 3,
    retry_interval_hours INT NOT NULL DEFAULT 4,
    max_concurrent INT NOT NULL DEFAULT 5,
    schedule_time TIMESTAMPTZ,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 6. Campaign Contacts Table
CREATE TABLE IF NOT EXISTS public.campaign_contacts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    campaign_id UUID NOT NULL REFERENCES public.campaigns(id) ON DELETE CASCADE,
    name TEXT,
    phone TEXT NOT NULL,
    status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'dialing', 'answered', 'failed', 'completed', 'no_answer')),
    outcome TEXT NOT NULL DEFAULT 'pending' CHECK (outcome IN ('hot', 'warm', 'cold', 'no_answer', 'pending')),
    attempts INT NOT NULL DEFAULT 0,
    duration_seconds INT NOT NULL DEFAULT 0,
    notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 7. Conversations / Calls Table
CREATE TABLE IF NOT EXISTS public.conversations (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    employee_id UUID REFERENCES public.employees(id) ON DELETE SET NULL,
    employee_name TEXT,
    campaign_id UUID REFERENCES public.campaigns(id) ON DELETE SET NULL,
    campaign_name TEXT,
    call_type TEXT NOT NULL DEFAULT 'instant' CHECK (call_type IN ('instant', 'campaign', 'inbound', 'test')),
    contact_name TEXT,
    contact_phone TEXT NOT NULL,
    caller_phone TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('dialing', 'ringing', 'in_progress', 'completed', 'failed', 'no_answer')),
    duration_seconds INT NOT NULL DEFAULT 0,
    outcome TEXT NOT NULL DEFAULT 'warm' CHECK (outcome IN ('hot', 'warm', 'cold', 'converted', 'lost', 'no_answer')),
    summary TEXT,
    sentiment TEXT DEFAULT 'Positive (78%)',
    intent TEXT DEFAULT 'Product Inquiry',
    objections TEXT,
    conversion_score INT NOT NULL DEFAULT 75,
    transcript JSONB NOT NULL DEFAULT '[]'::jsonb,
    recording_url TEXT,
    user_notes TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 8. Transactions / Billing Table
CREATE TABLE IF NOT EXISTS public.transactions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
    amount NUMERIC NOT NULL,
    type TEXT NOT NULL CHECK (type IN ('topup', 'subscription', 'call_usage', 'number_rental')),
    description TEXT,
    status TEXT NOT NULL DEFAULT 'completed' CHECK (status IN ('completed', 'pending', 'failed')),
    balance_after NUMERIC NOT NULL,
    invoice_url TEXT,
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 9. System Settings Table
CREATE TABLE IF NOT EXISTS public.system_settings (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    vobiz_auth_id TEXT DEFAULT 'vobiz_live_auth_98124',
    vobiz_token TEXT DEFAULT 'token_sec_89218931203',
    sarvam_api_key TEXT DEFAULT 'sk_sarvam_99812481023',
    groq_api_key TEXT DEFAULT 'gsk_groq_prod_8819283129',
    default_language TEXT DEFAULT 'Hindi',
    default_retries INT DEFAULT 3,
    max_call_duration_seconds INT DEFAULT 600,
    recording_retention_days INT DEFAULT 30,
    webhook_url TEXT DEFAULT 'https://api.voiceai.studio/webhooks/vobiz',
    webhook_secret TEXT DEFAULT 'whsec_99321849124',
    smtp_host TEXT DEFAULT 'smtp.resend.com',
    smtp_port INT DEFAULT 587,
    smtp_user TEXT DEFAULT 'alerts@voiceai.studio',
    updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 10. Audit Logs & System Alerts Table
CREATE TABLE IF NOT EXISTS public.audit_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID REFERENCES public.profiles(id) ON DELETE SET NULL,
    user_name TEXT,
    action TEXT NOT NULL,
    details TEXT,
    category TEXT NOT NULL DEFAULT 'info' CHECK (category IN ('info', 'warning', 'error', 'alert')),
    created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- Turn on RLS for all tables
ALTER TABLE public.profiles ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.phone_numbers ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employees ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.employee_templates ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaigns ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.campaign_contacts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.conversations ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.transactions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_settings ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Permissive public policies for full platform functionality
DROP POLICY IF EXISTS "Public access profiles" ON public.profiles;
CREATE POLICY "Public access profiles" ON public.profiles FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access phone_numbers" ON public.phone_numbers;
CREATE POLICY "Public access phone_numbers" ON public.phone_numbers FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access employees" ON public.employees;
CREATE POLICY "Public access employees" ON public.employees FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access employee_templates" ON public.employee_templates;
CREATE POLICY "Public access employee_templates" ON public.employee_templates FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access campaigns" ON public.campaigns;
CREATE POLICY "Public access campaigns" ON public.campaigns FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access campaign_contacts" ON public.campaign_contacts;
CREATE POLICY "Public access campaign_contacts" ON public.campaign_contacts FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access conversations" ON public.conversations;
CREATE POLICY "Public access conversations" ON public.conversations FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access transactions" ON public.transactions;
CREATE POLICY "Public access transactions" ON public.transactions FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access system_settings" ON public.system_settings;
CREATE POLICY "Public access system_settings" ON public.system_settings FOR ALL USING (true) WITH CHECK (true);

DROP POLICY IF EXISTS "Public access audit_logs" ON public.audit_logs;
CREATE POLICY "Public access audit_logs" ON public.audit_logs FOR ALL USING (true) WITH CHECK (true);
