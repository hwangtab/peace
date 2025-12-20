import { render, screen, fireEvent } from '@testing-library/react';
import EventFilter from '../EventFilter';

describe('EventFilter Component', () => {
    const mockOnFilterChange = jest.fn();

    beforeEach(() => {
        mockOnFilterChange.mockClear();
    });

    describe('Rendering', () => {
        it('renders all filter buttons', () => {
            render(
                <EventFilter
                    selectedFilter="all"
                    onFilterChange={mockOnFilterChange}
                />
            );

            expect(screen.getByText('전체')).toBeInTheDocument();
            expect(screen.getByText('2023 캠프')).toBeInTheDocument();
            expect(screen.getByText('2024 앨범')).toBeInTheDocument();
            expect(screen.getByText('2025 캠프')).toBeInTheDocument();
        });

        it('renders press filter order correctly', () => {
            render(
                <EventFilter
                    selectedFilter="all"
                    onFilterChange={mockOnFilterChange}
                    filterOrder="press"
                />
            );

            const buttons = screen.getAllByRole('button');
            expect(buttons[0]).toHaveTextContent('전체');
            expect(buttons[1]).toHaveTextContent('2024 앨범');
            expect(buttons[2]).toHaveTextContent('2023 캠프');
            expect(buttons[3]).toHaveTextContent('2025 캠프');
        });
    });

    describe('Active State', () => {
        it('applies active styles to selected filter', () => {
            render(
                <EventFilter
                    selectedFilter="camp-2023"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const activeButton = screen.getByText('2023 캠프');
            expect(activeButton).toHaveClass('bg-jeju-ocean', 'text-white');
        });

        it('applies inactive styles to non-selected filters', () => {
            render(
                <EventFilter
                    selectedFilter="camp-2023"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const inactiveButton = screen.getByText('전체');
            expect(inactiveButton).toHaveClass('bg-white', 'text-jeju-ocean', 'border-2');
        });
    });

    describe('Color Schemes', () => {
        it('applies ocean color scheme by default', () => {
            render(
                <EventFilter
                    selectedFilter="all"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const button = screen.getByText('전체');
            expect(button).toHaveClass('bg-jeju-ocean');
        });

        it('applies orange color scheme when specified', () => {
            render(
                <EventFilter
                    selectedFilter="all"
                    onFilterChange={mockOnFilterChange}
                    colorScheme="orange"
                />
            );

            const button = screen.getByText('전체');
            expect(button).toHaveClass('bg-orange-600');
        });
    });

    describe('User Interaction', () => {
        it('calls onFilterChange when button is clicked', () => {
            render(
                <EventFilter
                    selectedFilter="all"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const button = screen.getByText('2023 캠프');
            fireEvent.click(button);

            expect(mockOnFilterChange).toHaveBeenCalledTimes(1);
            expect(mockOnFilterChange).toHaveBeenCalledWith('camp-2023');
        });

        it('handles multiple filter changes', () => {
            render(
                <EventFilter
                    selectedFilter="all"
                    onFilterChange={mockOnFilterChange}
                />
            );

            fireEvent.click(screen.getByText('2023 캠프'));
            fireEvent.click(screen.getByText('2024 앨범'));
            fireEvent.click(screen.getByText('전체'));

            expect(mockOnFilterChange).toHaveBeenCalledTimes(3);
            expect(mockOnFilterChange).toHaveBeenNthCalledWith(1, 'camp-2023');
            expect(mockOnFilterChange).toHaveBeenNthCalledWith(2, 'album-2024');
            expect(mockOnFilterChange).toHaveBeenNthCalledWith(3, 'all');
        });
    });

    describe('Accessibility', () => {
        it('has proper ARIA role', () => {
            render(
                <EventFilter
                    selectedFilter="all"
                    onFilterChange={mockOnFilterChange}
                />
            );

            expect(screen.getByRole('group')).toHaveAttribute('aria-label', '이벤트 필터');
        });

        it('sets aria-pressed on active button', () => {
            render(
                <EventFilter
                    selectedFilter="camp-2023"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const activeButton = screen.getByText('2023 캠프');
            expect(activeButton).toHaveAttribute('aria-pressed', 'true');
        });

        it('sets aria-pressed false on inactive buttons', () => {
            render(
                <EventFilter
                    selectedFilter="camp-2023"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const inactiveButton = screen.getByText('전체');
            expect(inactiveButton).toHaveAttribute('aria-pressed', 'false');
        });

        it('has descriptive aria-label for each button', () => {
            render(
                <EventFilter
                    selectedFilter="all"
                    onFilterChange={mockOnFilterChange}
                />
            );

            const activeButton = screen.getByLabelText('전체 필터 (선택됨)');
            expect(activeButton).toBeInTheDocument();

            const inactiveButton = screen.getByLabelText('2023 캠프 필터');
            expect(inactiveButton).toBeInTheDocument();
        });
    });
});
