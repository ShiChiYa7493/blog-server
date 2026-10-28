import {
  buildObjectKey,
  buildPublicUrl,
  generateUploadFilename,
  isAbsoluteUrl,
} from './cos-storage.helpers';

describe('cos-storage helpers', () => {
  it('keeps the legacy timestamp-random naming scheme and the extension', () => {
    expect(generateUploadFilename('photo.PNG')).toMatch(/^\d+-\d+\.PNG$/);
    expect(generateUploadFilename('no-extension')).toMatch(/^\d+-\d+$/);
  });

  it('puts blog objects under the uploads/blog prefix', () => {
    expect(buildObjectKey('123-456.png')).toBe('uploads/blog/123-456.png');
  });

  it('joins the public base URL without duplicate slashes', () => {
    expect(buildPublicUrl('https://img.shichiya.cn/', 'uploads/blog/a.png')).toBe(
      'https://img.shichiya.cn/uploads/blog/a.png',
    );
    expect(buildPublicUrl('https://img.shichiya.cn', 'uploads/blog/a.png')).toBe(
      'https://img.shichiya.cn/uploads/blog/a.png',
    );
  });

  it('distinguishes absolute URLs from local /uploads paths', () => {
    expect(isAbsoluteUrl('https://img.shichiya.cn/uploads/blog/a.png')).toBe(true);
    expect(isAbsoluteUrl('http://example.com/a.png')).toBe(true);
    expect(isAbsoluteUrl('/uploads/a.png')).toBe(false);
    expect(isAbsoluteUrl(null)).toBe(false);
  });
});
