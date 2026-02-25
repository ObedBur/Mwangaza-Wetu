'use client';

import Navbar from '@/components/Navbar';
import LoginCard from '@/components/auth/LoginCard';
import Footer from '@/components/Footer';

export default function LoginPage() {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center px-4 py-6 sm:px-6 lg:px-8">
      {/* Background Pattern */}
      <div
        className="fixed inset-0 z-0 opacity-[0.03] pointer-events-none"
        style={{
          backgroundImage:
            "url('data:image/svg+xml,%3Csvg width=%22100%22 height=%22100%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cdefs%3E%3ClinearGradient id=%22gradient%22 x1=%220%25%22 y1=%220%25%22 x2=%22100%25%22 y2=%22100%25%22%3E%3Cstop offset=%220%25%22 style=%22stop-color:rgb(30,59,138);stop-opacity:1%22 /%3E%3Cstop offset=%22100%25%22 style=%22stop-color:rgb(16,185,129);stop-opacity:1%22 /%3E%3C/linearGradient%3E%3C/defs%3E%3Crect width=%22100%22 height=%22100%22 fill=%22url(%23gradient)%22/%3E%3C/svg%3E')",
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      />

      {/* Navbar */}
      <Navbar />

      {/* Main Content */}
      <div className="w-full max-w-md">
        <LoginCard />
      </div>

      {/* Footer */}
      <Footer />
    </div>
  );
}
