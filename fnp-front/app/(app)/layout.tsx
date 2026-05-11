import SiteHeader from "../components/common/Header";


export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <div className="wrapper relative">
      <SiteHeader />
      {children}
    </div>
  );
}
