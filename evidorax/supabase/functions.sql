-- EvidoraX — Usage tracking function
-- Run this after schema.sql in Supabase SQL editor

CREATE OR REPLACE FUNCTION increment_papers_used(user_id_input UUID)
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET papers_used = papers_used + 1,
      updated_at = NOW()
  WHERE id = user_id_input;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Plan limits reference (enforced in application logic via checkPaperLimit)
-- free:        5 papers lifetime
-- starter:     50 papers/month included, $0.50 overage
-- researcher:  200 papers/month included, $0.40 overage
-- institution: 1000 papers/month included, $0.25 overage

CREATE OR REPLACE FUNCTION reset_monthly_usage()
RETURNS void AS $$
BEGIN
  UPDATE public.profiles
  SET papers_used = 0
  WHERE plan != 'free';
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Schedule this with pg_cron or a Vercel cron hitting an API route monthly:
-- SELECT cron.schedule('reset-usage', '0 0 1 * *', 'SELECT reset_monthly_usage()');
