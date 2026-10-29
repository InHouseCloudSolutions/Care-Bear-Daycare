import BookStayPage from '@/components/pet-parent/BookStayPage';
import { ROBOTS_NOINDEX } from '@/utils/seo';

export const metadata = {
  title: 'Book a stay',
  robots: ROBOTS_NOINDEX,
};

export default function BookStayRoute() {
  return <BookStayPage />;
}
