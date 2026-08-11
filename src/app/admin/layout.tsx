export default function AdminLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <>
      <style>{`
        main > section > div.flex.border-b.border-edge.gap-6.mb-8 > button:nth-child(3) {
          display: none !important;
        }

        main > section > div.max-w-2xl.mx-auto.space-y-6 {
          display: none !important;
        }
      `}</style>
      {children}
    </>
  );
}
