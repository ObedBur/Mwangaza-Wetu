'use client';

export default function Footer() {
  return (
    <footer className="mt-8 text-center text-gray-400 text-xs">
      <p>© 2026 Coopérative Mwangaza Wetu. All rights reserved.</p>
      <div className="flex justify-center gap-4 mt-2">
        <a href="#" className="hover:text-primary transition-colors">
          Privacy Policy
        </a>
        <span>•</span>
        <a href="#" className="hover:text-primary transition-colors">
          Terms of Service
        </a>
        <span>•</span>
        <a href="#" className="hover:text-primary transition-colors">
          Help Center
        </a>
      </div>
    </footer>
  );
}
