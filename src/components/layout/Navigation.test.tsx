import React from 'react';
import { render, screen, fireEvent, waitFor } from '../../test-utils';
import Navigation from './Navigation';
import { act } from 'react-dom/test-utils';

// Mock resize observer for responsive checks if needed
// window.resizeTo = function (width, height) {
//     Object.assign(this, {
//         innerWidth: width,
//         innerHeight: height,
//         outerWidth: width,
//         outerHeight: height,
//     }).dispatchEvent(new this.Event('resize'));
// };

describe('Navigation Component', () => {
    test('renders logo link', () => {
        render(<Navigation />);
        expect(screen.getByText('강정피스앤뮤직캠프')).toBeInTheDocument();
    });

    test('renders desktop menu items', () => {
        render(<Navigation />);
        // "홈" link might appear in both mobile and desktop, so checking for one is sufficient for now
        // or check visibility classes if we were testing styles deeply
        const homeLinks = screen.getAllByText('홈');
        expect(homeLinks.length).toBeGreaterThan(0);
    });

    test('mobile menu toggle works', async () => {
        render(<Navigation />);

        // Find toggle button by aria-label
        const toggleButton = screen.getByLabelText('메뉴 열기');
        expect(toggleButton).toBeInTheDocument();
        expect(toggleButton).toHaveAttribute('aria-expanded', 'false');

        // Click to open
        await act(async () => {
            fireEvent.click(toggleButton);
        });

        // Aria label should change (if implementation supports dynamic label)
        // Check if mobile menu container is present by test id
        await waitFor(() => {
            expect(screen.getByTestId('mobile-menu')).toBeInTheDocument();
        });
    });

    test('dropdown interaction', async () => {
        render(<Navigation />);

        // Click "캠프" dropdown trigger
        const dropdownTriggers = screen.getAllByText('캠프');
        // Assuming the first one is desktop or mobile, let's just click the visible one.
        // For simple integration test, scanning for text is okay.

        const trigger = dropdownTriggers[0];
        await act(async () => {
            fireEvent.click(trigger);
        });

        // Check for dropdown content
        expect(screen.getAllByText('2023 캠프')[0]).toBeVisible();
    });
});
