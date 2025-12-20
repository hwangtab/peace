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
            const { container } = render(<Button variant="gold">Gold Button</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('bg-golden-sun');
        });

        it('applies size classes', () => {
            const { container } = render(<Button size="lg">Large Button</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveClass('px-12', 'py-4', 'text-lg');
        });

        it('applies fullWidth class when prop is true', () => {
            const { container } = render(<Button fullWidth>Full Width</Button>);
            const button = container.querySelector('button');
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
            const link = screen.getByText('Internal Link');
            expect(link).toHaveAttribute('href', '/test');
        });
    });

    describe('External Link (href + external)', () => {
        it('renders with rel attributes for security', () => {
            render(<Button href="https://example.com" external>External Link</Button>);
            const link = screen.getByText('External Link');
            expect(link).toHaveAttribute('rel', 'noopener noreferrer');
            expect(link).toHaveAttribute('target', '_blank');
        });

        it('renders internal href without target blank', () => {
            render(<Button href="/internal">Internal Href</Button>);
            const link = screen.getByText('Internal Href');
            expect(link).not.toHaveAttribute('target');
        });
    });

    describe('Button element', () => {
        it('renders as button when no href/to provided', () => {
            const { container } = render(<Button>Button</Button>);
            expect(container.querySelector('button')).toBeInTheDocument();
        });

        it('handles disabled state', () => {
            const { container } = render(<Button disabled>Disabled</Button>);
            const button = container.querySelector('button');
            expect(button).toBeDisabled();
            expect(button).toHaveClass('opacity-50', 'cursor-not-allowed');
        });

        it('sets correct button type', () => {
            const { container } = render(<Button type="submit">Submit</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveAttribute('type', 'submit');
        });
    });

    describe('Accessibility', () => {
        it('applies aria-label when provided', () => {
            const { container } = render(<Button ariaLabel="Close dialog">X</Button>);
            const button = container.querySelector('button');
            expect(button).toHaveAttribute('aria-label', 'Close dialog');
        });
    });
});
