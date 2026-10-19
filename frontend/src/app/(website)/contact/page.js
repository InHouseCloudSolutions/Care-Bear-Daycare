import ContactFormPage from '@/components/contact-form/ContactFormPage';
import { pageMetadata } from '@/utils/website-seo';

export const metadata = pageMetadata('/contact');

export default function ContactRoute() {
  return <ContactFormPage />;
}
