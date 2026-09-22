import { redirect } from 'next/navigation';

export const metadata = {
  title: 'BioAI Toolkit',
  description: 'AI code review and literature research for biotechnology students',
};

export default function Home() {
  redirect('/login');
}
