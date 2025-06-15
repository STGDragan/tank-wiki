
-- Schedule a daily check for maintenance tasks at 5 AM UTC.
select
cron.schedule(
  'daily-maintenance-check',
  '0 5 * * *',
  $$
  select
    net.http_post(
        url:='https://zlkefvmjdlqewcreqhko.supabase.co/functions/v1/maintenance-reminder',
        headers:='{"Content-Type": "application/json", "Authorization": "Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Inpsa2Vmdm1qZGxxZXdjcmVxaGtvIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDk5MTI2ODcsImV4cCI6MjA2NTQ4ODY4N30.MJe_4Gvtpj2x1J5TcLorVXzyNFrMxjLvh0mBLXdhNT8"}'::jsonb
    ) as request_id;
  $$
);
