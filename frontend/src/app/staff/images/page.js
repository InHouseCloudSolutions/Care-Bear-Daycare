import { redirect } from 'next/navigation';
import { staffPath } from '@/consts/routes';

export default function StaffImagesRoute() {
  redirect(`${staffPath()}?tab=home_slide`);
}
