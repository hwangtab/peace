import { ROUTES } from '../../constants/routes';

export const simpleMenuItems = [
    { nameKey: 'nav.home', path: ROUTES.HOME },
    { nameKey: 'nav.gallery', path: ROUTES.GALLERY },
    { nameKey: 'nav.video', path: ROUTES.VIDEOS },
    { nameKey: 'nav.press', path: ROUTES.PRESS },
];

export const campItems = [
    { nameKey: 'nav.camp_2023', path: ROUTES.CAMPS.CAMP_2023 },
    { nameKey: 'nav.camp_2025', path: ROUTES.CAMPS.CAMP_2025 },
    { nameKey: 'nav.camp_2026', path: ROUTES.CAMPS.CAMP_2026 },
];

export const albumItems = [
    { nameKey: 'nav.album_about', path: ROUTES.ALBUM.ABOUT },
    { nameKey: 'nav.musician', path: ROUTES.ALBUM.MUSICIANS },
    { nameKey: 'nav.track', path: ROUTES.ALBUM.TRACKS },
];
