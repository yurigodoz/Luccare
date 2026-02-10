import Navbar from '@/components/Navbar';

export default function PrivateLayout({ children }) {
  return (
    <div className="min-h-screen flex flex-col bg-blue-50">
      <Navbar />
      <main className="flex-1">
        {children}
      </main>
    </div>
  );
}
