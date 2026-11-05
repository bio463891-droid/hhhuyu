-- ===== Admin commands (run in Supabase SQL Editor) =====

-- Set a match's odds (the database rejects anything outside 1.00 - 2.00)
update public.matches set odds = 1.35 where id = 22;

-- Odds for several matches at once
-- update public.matches set odds = v.odds from (values (22, 1.35), (23, 1.80)) as v(id, odds) where matches.id = v.id;

-- Generate top-up codes: 50 codes, each worth 10000
select * from public.generate_topup_codes(10000, 50);

-- Follow up on codes
select code, amount, status, used_by, used_at from public.topup_codes order by created_at desc limit 100;

-- Disable an unused code
-- update public.topup_codes set status = 'disabled' where code = '123456789012' and status = 'unused';

-- Require ALL existing accounts to verify before predicting (by default only new accounts are required)
-- update public.gate_config set enforce_from = '2000-01-01' where id = 1;

-- Go back to exempting everyone created before now
-- update public.gate_config set enforce_from = now() where id = 1;
