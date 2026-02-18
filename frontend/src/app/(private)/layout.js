import Navbar from '@/components/Navbar';

export default function PrivateLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <Navbar />
      <main className="flex-1 pb-20 sm:pb-0 sm:pt-14">
        {children}
      </main>
    </div>
  );
}
