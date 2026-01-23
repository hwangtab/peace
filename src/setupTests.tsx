// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock react-error-boundary for tests as it might be ESM only
import React from 'react';

jest.mock('react-error-boundary', () => ({
  ErrorBoundary: ({ children }: { children: React.ReactNode }) => <div>{children} </div>,
  useErrorBoundary: () => ({ resetBoundary: jest.fn() }),
}));
// Mock framer-motion to skip animations
type MotionComponentProps = React.HTMLAttributes<HTMLElement> & { children?: React.ReactNode };

jest.mock('framer-motion', () => ({
  motion: {
    div: ({ children, ...props }: MotionComponentProps) => <div {...props}>{children}</div>,
    span: ({ children, ...props }: MotionComponentProps) => <span {...props}>{children}</span>,
    button: ({ children, ...props }: MotionComponentProps) => <button {...props}>{children}</button>,
  },
  AnimatePresence: ({ children }: { children: React.ReactNode }) => <>{children}</>,
}));
