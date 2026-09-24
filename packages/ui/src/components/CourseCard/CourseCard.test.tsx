import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { CourseCard } from './CourseCard';

describe('CourseCard', () => {
  it('shows the image with alt text when given', () => {
    render(<CourseCard title="קורס התהפכות" image="/about.jpg" imageAlt="תינוק מתהפך" />);
    expect(screen.getByRole('img', { name: 'תינוק מתהפך' })).toHaveAttribute('src', '/about.jpg');
  });

  it('falls back to an emoji without an image', () => {
    const { container } = render(<CourseCard title="קורס שכיבה על הבטן" emoji="🤱" />);
    expect(container.querySelector('img')).toBeNull();
    expect(container).toHaveTextContent('🤱');
  });

  it('does not render a cta for a coming-soon course, keeping it out of tab order', () => {
    const { container } = render(
      <CourseCard title="בקרוב" comingSoon status="בקרוב" cta={<button>לקורס</button>} />,
    );
    expect(container.firstElementChild).toHaveClass('bs-course-card--soon');
    expect(screen.queryByRole('button', { name: 'לקורס' })).not.toBeInTheDocument();
  });
});
