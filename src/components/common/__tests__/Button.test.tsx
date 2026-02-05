import { render, screen } from '@testing-library/react';
import { BrowserRouter } from 'react-router-dom';
import Button from '../Button';

describe('Button Component', () => {
    describe('Rendering', () => {
        it('renders children correctly', () => {
            render(<Button>Click me</Button>);
            expect(screen.getByText('Click me')).toBeInTheDocument();
        });

        it('applies variant classes', () => {
            render(<Button variant="gold">Gold Button</Button>);
            const button = screen.getByRole('button', { name: 'Gold Button' });
            expect(button).toHaveClass('bg-golden-sun');
        });

        it('applies size classes', () => {
            render(<Button size="lg">Large Button</Button>);
            const button = screen.getByRole('button', { name: 'Large Button' });
            expect(button).toHaveClass('px-12', 'py-4', 'text-lg');
        });

        it('applies fullWidth class when prop is true', () => {
            render(<Button fullWidth>Full Width</Button>);
            const button = screen.getByRole('button', { name: 'Full Width' });
            expect(button).toHaveClass('w-full');
        });
    });

    describe('Internal Link (to prop)', () => {
        it('renders as Link component', () => {
            render(
                <BrowserRouter>
                    <Button to="/test">Internal Link</Button>
                </BrowserRouter>
            );
            const link = screen.getByRole('link', { name: 'Internal Link' });
            expect(link).toHaveAttribute('href', '/test');
        });
    });

    describe('External Link (href + external)', () => {
        it('renders with rel attributes for security', () => {
            render(<Button href="https://example.com" external>External Link</Button>);
            const link = screen.getByRole('link', { name: 'External Link' });
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
            expect(link).toHaveAttribute('target', '_blank');
        });

        it('renders internal href without target blank', () => {
            render(<Button href="/internal">Internal Href</Button>);
            const link = screen.getByRole('link', { name: 'Internal Href' });
            expect(link).not.toHaveAttribute('target');
        });
    });

    describe('Button element', () => {
        it('renders as button when no href/to provided', () => {
            render(<Button>Button</Button>);
            expect(screen.getByRole('button', { name: 'Button' })).toBeInTheDocument();
        });

        it('handles disabled state', () => {
            render(<Button disabled>Disabled</Button>);
            const button = screen.getByRole('button', { name: 'Disabled' });
            expect(button).toBeDisabled();
            expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
        });

        it('sets correct button type', () => {
            render(<Button type="submit">Submit</Button>);
            const button = screen.getByRole('button', { name: 'Submit' });
            expect(button).toHaveAttribute('type', 'submit');
        });
    });

    describe('Accessibility', () => {
        it('applies aria-label when provided', () => {
            render(<Button ariaLabel="Close dialog">X</Button>);
            const button = screen.getByRole('button', { name: 'Close dialog' });
            expect(button).toHaveAttribute('aria-label', 'Close dialog');
        });
    });
});
