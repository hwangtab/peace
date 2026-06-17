alter table public.archive_videos
  drop constraint if exists archive_videos_event_type_check;
alter table public.archive_gallery_images
  drop constraint if exists archive_gallery_images_event_type_check;
alter table public.archive_press_items
  drop constraint if exists archive_press_items_event_type_check;

alter table public.archive_videos
  add constraint archive_videos_event_type_check
  check (event_type in ('camp', 'album', 'live', 'music_video', 'interview'));
alter table public.archive_gallery_images
  add constraint archive_gallery_images_event_type_check
  check (event_type in ('camp', 'album', 'live', 'music_video', 'interview'));
alter table public.archive_press_items
  add constraint archive_press_items_event_type_check
  check (event_type in ('camp', 'album', 'live', 'music_video', 'interview'));
