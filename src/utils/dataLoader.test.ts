import fs from 'fs';
import path from 'path';

jest.mock('fs');

const mockedFs = fs as jest.Mocked<typeof fs>;

import {
  readJsonArrayResult,
  loadLocalizedData,
  loadGalleryImages,
  selectHomeGalleryPreviewImages,
} from './dataLoader';

describe('readJsonArrayResult', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('파일이 없으면 status not_found 반환', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const result = readJsonArrayResult('/missing/file.json');
    expect(result.status).toBe('not_found');
    expect(result.data).toEqual([]);
  });

  it('유효한 JSON 배열 파일 → status ok, data 반환', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('[{"id":1}]');
    const result = readJsonArrayResult<{ id: number }>('/valid.json');
    expect(result.status).toBe('ok');
    expect(result.data).toEqual([{ id: 1 }]);
  });

  it('빈 배열 파일 → status empty', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('[]');
    const result = readJsonArrayResult('/empty.json');
    expect(result.status).toBe('empty');
    expect(result.data).toEqual([]);
  });

  it('잘못된 JSON → Error throw', () => {
    mockedFs.existsSync.mockReturnValue(true);
    mockedFs.readFileSync.mockReturnValue('{bad}');
    expect(() => readJsonArrayResult('/bad.json')).toThrow();
  });
});

describe('loadLocalizedData', () => {
  const cwd = process.cwd();
  const root = path.join(cwd, 'public', 'data');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('ko locale → 기본 경로에서 데이터 반환', () => {
    mockedFs.existsSync.mockImplementation((p) => p === path.join(root, 'items.json'));
    mockedFs.readFileSync.mockReturnValue('[{"id":1}]');
    const data = loadLocalizedData<{ id: number }>('ko', 'items.json');
    expect(data).toEqual([{ id: 1 }]);
  });

  it('en locale → locale 경로 먼저, 없으면 기본 경로 fallback', () => {
    const enPath = path.join(root, 'en', 'items.json');
    const defaultPath = path.join(root, 'items.json');
    mockedFs.existsSync.mockImplementation((p) => p === defaultPath);
    mockedFs.readFileSync.mockReturnValue('[{"id":2}]');
    const data = loadLocalizedData<{ id: number }>('en', 'items.json');
    expect(data).toEqual([{ id: 2 }]);
    expect(mockedFs.existsSync).toHaveBeenCalledWith(enPath);
  });

  it('en locale → en 경로에 데이터 있으면 en 경로 사용', () => {
    const enPath = path.join(root, 'en', 'items.json');
    mockedFs.existsSync.mockImplementation((p) => p === enPath);
    mockedFs.readFileSync.mockReturnValue('[{"id":3}]');
    const data = loadLocalizedData<{ id: number }>('en', 'items.json');
    expect(data).toEqual([{ id: 3 }]);
  });

  it('mergeByIdKey 옵션 → locale, en, 기본 데이터 순서로 id 병합', () => {
    const esPath = path.join(root, 'es', 'items.json');
    const enPath = path.join(root, 'en', 'items.json');
    const defaultPath = path.join(root, 'items.json');
    mockedFs.existsSync.mockImplementation(
      (p) => p === esPath || p === enPath || p === defaultPath
    );
    mockedFs.readFileSync.mockImplementation((p) => {
      if (p === esPath) return '[{"id":1,"lang":"es"}]';
      if (p === enPath) return '[{"id":1,"lang":"en"},{"id":2,"lang":"en"}]';
      if (p === defaultPath) return '[{"id":2,"lang":"ko"},{"id":3,"lang":"ko"}]';
      return '[]';
    });

    const data = loadLocalizedData<{ id: number; lang: string }>('es', 'items.json', {
      mergeByIdKey: 'id',
    });

    expect(data).toEqual([
      { id: 1, lang: 'es' },
      { id: 2, lang: 'en' },
      { id: 3, lang: 'ko' },
    ]);
  });

  it('모든 경로 없으면 Error throw', () => {
    mockedFs.existsSync.mockReturnValue(false);
    expect(() => loadLocalizedData('en', 'missing.json')).toThrow();
  });

  it('파일 존재하지만 빈 배열 → 빈 배열 반환', () => {
    mockedFs.existsSync.mockImplementation((p) => p === path.join(root, 'empty.json'));
    mockedFs.readFileSync.mockReturnValue('[]');
    const data = loadLocalizedData('ko', 'empty.json');
    expect(data).toEqual([]);
  });
});

describe('loadGalleryImages', () => {
  const cwd = process.cwd();
  const galleryRoot = path.join(cwd, 'public', 'data', 'gallery');

  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('존재하는 카테고리 파일의 이미지를 합쳐 반환', () => {
    const albumPath = path.join(galleryRoot, 'album.json');
    mockedFs.existsSync.mockImplementation((p) => p === albumPath);
    mockedFs.readFileSync.mockReturnValue('[{"src":"img1.jpg"}]');
    const images = loadGalleryImages<{ src: string }>();
    expect(images).toEqual([{ src: 'img1.jpg' }]);
  });

  it('모든 카테고리 파일 없으면 빈 배열 반환', () => {
    mockedFs.existsSync.mockReturnValue(false);
    const images = loadGalleryImages();
    expect(images).toEqual([]);
  });

  it('여러 카테고리의 이미지를 순서대로 합침', () => {
    const albumPath = path.join(galleryRoot, 'album.json');
    const camp2023Path = path.join(galleryRoot, 'camp2023.json');
    mockedFs.existsSync.mockImplementation((p) => p === albumPath || p === camp2023Path);
    mockedFs.readFileSync.mockImplementation((p) => {
      if (p === albumPath) return '[{"src":"a.jpg"}]';
      if (p === camp2023Path) return '[{"src":"b.jpg"}]';
      return '[]';
    });
    const images = loadGalleryImages<{ src: string }>();
    expect(images).toEqual([{ src: 'a.jpg' }, { src: 'b.jpg' }]);
  });
});

describe('selectHomeGalleryPreviewImages', () => {
  it('홈 갤러리 preview 를 앨범과 각 연도 캠프 이미지로 균형 있게 구성', () => {
    const images = [
      ...Array.from({ length: 6 }, (_, index) => ({
        id: index + 1,
        eventType: 'album',
        eventYear: 2024,
      })),
      ...Array.from({ length: 6 }, (_, index) => ({
        id: index + 101,
        eventType: 'camp',
        eventYear: 2023,
      })),
      ...Array.from({ length: 6 }, (_, index) => ({
        id: index + 201,
        eventType: 'camp',
        eventYear: 2025,
      })),
      ...Array.from({ length: 6 }, (_, index) => ({
        id: index + 301,
        eventType: 'camp',
        eventYear: 2026,
      })),
    ];

    const preview = selectHomeGalleryPreviewImages(images);

    expect(preview).toHaveLength(16);
    expect(
      preview.filter((image) => image.eventType === 'album' && image.eventYear === 2024)
    ).toHaveLength(4);
    expect(
      preview.filter((image) => image.eventType === 'camp' && image.eventYear === 2023)
    ).toHaveLength(4);
    expect(
      preview.filter((image) => image.eventType === 'camp' && image.eventYear === 2025)
    ).toHaveLength(4);
    expect(
      preview.filter((image) => image.eventType === 'camp' && image.eventYear === 2026)
    ).toHaveLength(4);
  });
});
