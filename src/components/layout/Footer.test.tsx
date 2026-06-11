import React from 'react';
import { render, screen } from '@/test-utils';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/test-utils/i18n-test';
import Footer from './Footer';

describe('Footer Component', () => {
  const renderWithI18n = (component: React.ReactElement) => {
    return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
  };

  test('renders site name', () => {
    renderWithI18n(<Footer />);
    expect(screen.getByText(i18n.t('app.title'))).toBeInTheDocument();
  });

  test('renders Instagram link with correct URL', () => {
    renderWithI18n(<Footer />);
    const instagramLink = screen.getByRole('link', { name: /instagram/i });
    expect(instagramLink).toBeInTheDocument();
    expect(instagramLink).toHaveAttribute(
      'href',
      'https://www.instagram.com/peace_music_in_gangjeong'
    );
    expect(instagramLink).toHaveAttribute('target', '_blank');
    // SNS 공식 계정 링크 — nofollow 제외 (링크 유전력 전달)
    expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
  });

  test('renders Email link with correct mailto', () => {
    renderWithI18n(<Footer />);
    const emailLink = screen.getByRole('link', { name: /email/i });
    expect(emailLink).toBeInTheDocument();
    expect(emailLink).toHaveAttribute('href', 'mailto:gpmc0625@gmail.com');
  });

  test('renders navigation menu links', () => {
    renderWithI18n(<Footer />);
    expect(screen.getByText(i18n.t('nav.home'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('nav.gallery'))).toBeInTheDocument();
    expect(screen.getByText(i18n.t('nav.video'))).toBeInTheDocument();
  });

  test('renders copyright with current year', () => {
    renderWithI18n(<Footer />);
    // 저작권 연도는 <span> 단일 요소로 렌더링됨
    const yearSpan = screen.getByText(String(new Date().getFullYear()));
    expect(yearSpan).toBeInTheDocument();
  });
});
