import React from 'react';
import { render, screen } from '../../test-utils';
import Footer from './Footer';

describe('Footer Component', () => {
    test('renders site name', () => {
        render(<Footer />);
        expect(screen.getByText('강정피스앤뮤직캠프')).toBeInTheDocument();
    });

    test('renders main tagline', () => {
        render(<Footer />);
        expect(screen.getByText('전쟁을 끝내자! 노래하자, 춤추자')).toBeInTheDocument();
    });

    test('renders Instagram link with correct URL', () => {
        render(<Footer />);
        const instagramLink = screen.getByLabelText('인스타그램에서 강정피스앤뮤직캠프 팔로우하기');
        expect(instagramLink).toBeInTheDocument();
        expect(instagramLink).toHaveAttribute('href', 'https://www.instagram.com/peace_music_in_gangjeong');
        expect(instagramLink).toHaveAttribute('target', '_blank');
        expect(instagramLink).toHaveAttribute('rel', 'noopener noreferrer');
    });

    test('renders Email link with correct mailto', () => {
        render(<Footer />);
        const emailLink = screen.getByLabelText('이메일로 연락하기');
        expect(emailLink).toBeInTheDocument();
        expect(emailLink).toHaveAttribute('href', 'mailto:gpmc0625@gmail.com');
    });

    test('renders navigation menu links', () => {
        render(<Footer />);
        expect(screen.getByText('홈')).toBeInTheDocument();
        expect(screen.getByText('갤러리')).toBeInTheDocument();
        expect(screen.getByText('비디오')).toBeInTheDocument();
    });

    test('renders copyright with 2026', () => {
        render(<Footer />);
        expect(screen.getByText('© 2026 강정피스앤뮤직캠프. All rights reserved.')).toBeInTheDocument();
    });
});
