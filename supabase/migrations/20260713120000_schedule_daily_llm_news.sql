-- daily-llm-news 루틴을 매일 09:02 KST(=00:02 UTC)에 호출하는 pg_cron 잡.
--
-- 실행 위치는 Vercel Function(apps/api/src/app/api/routines/daily-llm-news/route.ts)이다.
-- (처음엔 Supabase Edge Function으로 만들었으나, Edge Function은 request idle timeout이
--  150초로 고정이라 다회 웹서치+대량 생성이 걸리는 이 작업을 완주하지 못해 폐기했다.
--  Vercel Function은 maxDuration을 300~800초까지 늘릴 수 있어 이 작업에 맞다.
--  스케줄러는 여전히 Supabase Cron — pg_net이 호출하는 대상 URL만 바뀐 것.)
--
-- 사전 준비 (이 마이그레이션 적용 전, SQL Editor 또는 `supabase db query`로 1회 직접 실행 —
-- 시크릿 값이라 마이그레이션 파일에는 넣지 않는다). 여기 저장하는 값은 Supabase 키가 아니라
-- apps/api의 INGEST_TOKEN 값이다(이 라우트가 그 토큰으로 Authorization을 검증함):
--
--   select vault.create_secret(
--     '<INGEST_TOKEN 값>',                 -- apps/api/.env.local / Vercel 환경변수의 INGEST_TOKEN
--     'daily_llm_news_invoke_key'
--   );
--
-- (이전에 service_role 키로 등록했었다면 vault.update_secret으로 값을 INGEST_TOKEN으로 교체할 것.)

create extension if not exists pg_cron with schema pg_catalog;
create extension if not exists pg_net with schema extensions;

-- 재적용해도 잡이 중복되지 않도록 기존 동일 이름 잡을 먼저 제거.
do $$
begin
  if exists (select 1 from cron.job where jobname = 'daily-llm-news') then
    perform cron.unschedule('daily-llm-news');
  end if;
end
$$;

select cron.schedule(
  'daily-llm-news',
  '2 0 * * *', -- UTC 00:02 = KST 09:02 (기존 Claude 스케줄 작업과 동일 시각)
  $cron$
  select net.http_post(
    url := 'https://daily-newx.vercel.app/api/routines/daily-llm-news',
    headers := jsonb_build_object(
      'Content-Type', 'application/json',
      'Authorization', 'Bearer ' || (
        select decrypted_secret
        from vault.decrypted_secrets
        where name = 'daily_llm_news_invoke_key'
      )
    ),
    body := jsonb_build_object('triggered_at', now()),
    timeout_milliseconds := 290000 -- pg_net 자체 상한은 별개지만, 응답을 오래 기다리도록 넉넉히
  ) as request_id;
  $cron$
);

-- 실행 이력: select * from cron.job_run_details where jobid = (select jobid from cron.job where jobname = 'daily-llm-news') order by start_time desc limit 20;
-- 스케줄 해제:  select cron.unschedule('daily-llm-news');
