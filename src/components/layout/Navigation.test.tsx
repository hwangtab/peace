import React from 'react';
import { render, screen, fireEvent, waitFor } from '@/test-utils';
import { I18nextProvider } from 'react-i18next';
import i18n from '@/test-utils/i18n-test';
import Navigation from './Navigation';

const nextRouterMock = jest.requireMock('next/router') as {
  __setMockRouterState: (overrides: Record<string, unknown>) => void;
};

const setRouterPath = (pathname: string, asPath = pathname): void => {
  nextRouterMock.__setMockRouterState({
    pathname,
    route: pathname,
    asPath,
  });
};

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

  test('highlights album submenu on dynamic musician detail route', async () => {
    setRouterPath('/album/musicians/[id]', '/album/musicians/1');
    renderWithI18n(<Navigation />);

    const albumTriggers = screen.getAllByText(i18n.t('nav.album'));
    const albumTrigger = albumTriggers[0];
    expect(albumTrigger).toBeDefined();
    if (albumTrigger) {
      fireEvent.click(albumTrigger);
    }

    await waitFor(() => {
      const musicianLink = screen.getByRole('link', { name: i18n.t('nav.musician') });
      expect(musicianLink).toHaveClass('bg-ocean-sand', 'text-jeju-ocean');
    });
  });

  test('highlights camp submenu on dynamic camp musician detail route', async () => {
    setRouterPath('/camps/2026/musicians/[id]', '/camps/2026/musicians/14');
    renderWithI18n(<Navigation />);

    const campTriggers = screen.getAllByText(i18n.t('nav.camp'));
    const campTrigger = campTriggers[0];
    expect(campTrigger).toBeDefined();
    if (campTrigger) {
      fireEvent.click(campTrigger);
    }

    await waitFor(() => {
      const campLink = screen.getByRole('link', { name: i18n.t('nav.camp_2026') });
      expect(campLink).toHaveClass('bg-ocean-sand', 'text-jeju-ocean');
    });
  });

  test('highlights mobile submenu item on dynamic camp detail route', async () => {
    setRouterPath('/camps/2026/musicians/[id]', '/camps/2026/musicians/14');
    renderWithI18n(<Navigation />);

    const menuToggleButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuToggleButton);

    const campDropdownButton = screen
      .getAllByRole('button', { name: i18n.t('nav.camp') })
      .find((button) => button.getAttribute('aria-controls')?.startsWith('mobile-dropdown-'));

    expect(campDropdownButton).toBeDefined();
    if (campDropdownButton) {
      fireEvent.click(campDropdownButton);
    }

    await waitFor(() => {
      const mobileCampLink = screen.getByRole('link', { name: i18n.t('nav.camp_2026') });
      expect(mobileCampLink).toHaveClass('text-jeju-ocean');
    });
  });

  test('highlights mobile album submenu item on dynamic musician route', async () => {
    setRouterPath('/album/musicians/[id]', '/album/musicians/1');
    renderWithI18n(<Navigation />);

    const menuToggleButton = screen.getByRole('button', { name: /menu/i });
    fireEvent.click(menuToggleButton);

    const albumDropdownButton = screen
      .getAllByRole('button', { name: i18n.t('nav.album') })
      .find((button) => button.getAttribute('aria-controls')?.startsWith('mobile-dropdown-'));

    expect(albumDropdownButton).toBeDefined();
    if (albumDropdownButton) {
      fireEvent.click(albumDropdownButton);
    }

    await waitFor(() => {
      const mobileAlbumLink = screen.getByRole('link', { name: i18n.t('nav.musician') });
      expect(mobileAlbumLink).toHaveClass('text-jeju-ocean');
    });
  });
});
