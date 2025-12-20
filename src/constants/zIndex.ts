/**
 * Z-Index 계층 구조 - 일관된 스태킹 컨텍스트 관리
 * 
 * 사용법:
 * import { Z_INDEX } from '../constants/zIndex';
 * className={`z-[${Z_INDEX.modal}]`}
 */
export const Z_INDEX = {
    /** 기본 콘텐츠 레이어 */
    base: 0,

    /** 드롭다운 메뉴 */
    dropdown: 40,

    /** 고정 네비게이션 바 */
    sticky: 50,

    /** 모달, 라이트박스 */
    modal: 60,

    /** 툴팁 */
    tooltip: 70,

    /** 알림, 토스트 */
    notification: 80,
} as const;

export type ZIndexLevel = keyof typeof Z_INDEX;
