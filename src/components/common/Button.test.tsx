import React from 'react';
import { render, screen, fireEvent } from '../../test-utils';
import Button from './Button';

describe('Button Component', () => {
    test('renders button with text', () => {
        render(<Button>Click Me</Button>);
        expect(screen.getByText('Click Me')).toBeInTheDocument();
        expect(screen.getByRole('button')).toBeInTheDocument();
    });

    test('renders link when "to" prop is provided', () => {
        render(<Button to="/about">About Page</Button>);
        expect(screen.getByRole('link')).toHaveAttribute('href', '/about');
    });

    test('renders external anchor when "href" and "external" props are provided', () => {
        render(<Button href="https://google.com" external>External Link</Button>);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', 'https://google.com');
        expect(link).toHaveAttribute('target', '_blank');
        expect(link).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('applies variant classes correctly', () => {
        render(<Button variant="gold">Gold Button</Button>);
        const button = screen.getByRole('button');
        expect(button).toHaveClass('bg-golden-sun');
    });

    test('handles onClick events', () => {
        const handleClick = jest.fn();
        render(<Button onClick={handleClick}>Click Me</Button>);
        fireEvent.click(screen.getByRole('button'));
        expect(handleClick).toHaveBeenCalledTimes(1);
    });

    test('renders with aria-label', () => {
        render(<Button ariaLabel="Close Menu">X</Button>);
        expect(screen.getByLabelText('Close Menu')).toBeInTheDocument();
    });

    test('is disabled when disabled prop is true', () => {
        render(<Button disabled>Disabled</Button>);
        const button = screen.getByRole('button');
        expect(button).toBeDisabled();
        expect(button).toHaveClass('opacity-50');
    });
});
