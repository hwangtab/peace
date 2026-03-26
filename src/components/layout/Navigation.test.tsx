import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/test-utils/i18n-test';
import Navigation from './Navigation';

jest.mock('framer-motion', () => {
  const actual = jest.requireActual('framer-motion');
  return {
    ...actual,
    LayoutGroup: ({ children }: { children: React.ReactNode }) => <>{children}</>,
  };
});

describe('Navigation Component', () => {
  const renderWithI18n = (component: React.ReactElement) => {
    return render(<I18nextProvider i18n={i18n}>{component}</I18nextProvider>);
  };

  test('renders logo link', () => {
    renderWithI18n(<Navigation />);
    expect(screen.getByText(i18n.t('app.title'))).toBeInTheDocument();
  });

  test('renders desktop menu items', () => {
    renderWithI18n(<Navigation />);
    const homeLinks = screen.getAllByText(i18n.t('nav.home'));
    expect(homeLinks.length).toBeGreaterThan(0);
  });

  test('mobile menu toggle works', async () => {
    renderWithI18n(<Navigation />);

    const toggleButton = screen.getByRole('button', { name: /menu/i });
    expect(toggleButton).toBeInTheDocument();
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'true');

    fireEvent.click(toggleButton);
    expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

    await waitFor(() => {
      expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
    });
  });

  test('dropdown interaction', async () => {
    renderWithI18n(<Navigation />);

    // Click "캠프" dropdown trigger
    const dropdownTriggers = screen.getAllByText(i18n.t('nav.camp'));
    const trigger = dropdownTriggers[0];
    expect(trigger).toBeInTheDocument();
    if (trigger) {
      fireEvent.click(trigger);
    }

    // Check for dropdown content
    await waitFor(() => {
      const campLinks = screen.getAllByText(/2023/);
      expect(campLinks[0]).toBeInTheDocument();
    });
  });
});
