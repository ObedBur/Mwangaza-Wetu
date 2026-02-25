import { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Members - Mwangaza Wetu Dashboard',
  description: 'Manage cooperative members and their accounts.',
};

export default function MembersLayout({ children }: { children: React.ReactNode }) {
  return children;
}
