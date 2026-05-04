import './globals.css';

export const metadata = {
  title: 'Dashmesh Gases ERP — Industrial Gas Management System',
  description: 'Enterprise Resource Planning system for Dashmesh Gases - Managing industrial gas cylinders, welding accessories, customer accounts, and financial transactions.',
  keywords: 'ERP, industrial gases, oxygen, CO2, argon, welding, cylinder tracking, inventory management',
};

export default function RootLayout({ children }) {
  return (
    <html lang="en">
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700;800;900&family=Outfit:wght@300;400;500;600;700;800;900&family=JetBrains+Mono:wght@400;500;600&display=swap" rel="stylesheet" />
      </head>
      <body className="bg-dark-950 text-slate-200 antialiased">
        {children}
      </body>
    </html>
  );
}
