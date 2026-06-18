-- =====================================================================
--  BLOG SEED — public sitedeki mockup yazıları panele aktarır
--  Supabase > SQL Editor > New query'ye yapıştırıp Run edin.
--  Idempotent: slug çakışırsa atlar (tekrar çalıştırmak güvenli).
--
--  Yazılar TASLAK (draft) olarak eklenir; canlı siteye düşmez.
--  Panelden (Blog > Düzenle) gerçek içerikle güncelleyip "Yayınla" deyin.
--  Kaynak: src/data/blog.ts (BLOG_POSTS)
-- =====================================================================

insert into public.blog_posts
  (title, slug, category, excerpt, content, tags, status, read_min, likes, created_at, updated_at)
values
  (
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit',
    'lorem-ipsum-dolor-sit-amet-consectetur-adipiscing-elit',
    'Design',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.',
    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation.</p>',
    array['Design'],
    'draft', 3, 128, '2021-10-04T09:00:00Z', '2021-10-04T09:00:00Z'
  ),
  (
    'Make A Successful Instagram',
    'make-a-successful-instagram',
    'Lorem',
    'Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.',
    '<p>Lorem ipsum dolor sit amet, consectetur adipiscing elit. Sed do eiusmod tempor incididunt ut labore et dolore magna aliqua.</p>',
    array['Lorem'],
    'draft', 3, 15, '2021-10-04T08:30:00Z', '2021-10-04T08:30:00Z'
  ),
  (
    'Get Started In 3D Animation',
    'get-started-in-3d-animation',
    'Ipsum',
    'Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.',
    '<p>Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat.</p>',
    array['Ipsum'],
    'draft', 3, 720, '2021-10-04T08:00:00Z', '2021-10-04T08:00:00Z'
  ),
  (
    'Duis aute irure dolor in reprehenderit',
    'duis-aute-irure-dolor-in-reprehenderit',
    'Dolor',
    'Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint.',
    '<p>Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur excepteur sint.</p>',
    array['Dolor'],
    'draft', 4, 64, '2021-10-02T09:00:00Z', '2021-10-02T09:00:00Z'
  ),
  (
    'Excepteur sint occaecat cupidatat non proident',
    'excepteur-sint-occaecat-cupidatat-non-proident',
    'Amet',
    'Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.',
    '<p>Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>',
    array['Amet'],
    'draft', 5, 42, '2021-09-28T09:00:00Z', '2021-09-28T09:00:00Z'
  ),
  (
    'Sed ut perspiciatis unde omnis iste natus',
    'sed-ut-perspiciatis-unde-omnis-iste-natus',
    'Lorem',
    'Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.',
    '<p>Sed ut perspiciatis unde omnis iste natus error sit voluptatem accusantium doloremque laudantium, totam rem aperiam.</p>',
    array['Lorem'],
    'draft', 6, 96, '2021-09-21T09:00:00Z', '2021-09-21T09:00:00Z'
  ),
  (
    'Nemo enim ipsam voluptatem quia voluptas',
    'nemo-enim-ipsam-voluptatem-quia-voluptas',
    'Ipsum',
    'Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.',
    '<p>Nemo enim ipsam voluptatem quia voluptas sit aspernatur aut odit aut fugit, sed quia consequuntur magni dolores.</p>',
    array['Ipsum'],
    'draft', 3, 33, '2021-09-14T09:00:00Z', '2021-09-14T09:00:00Z'
  )
on conflict (slug) do nothing;
