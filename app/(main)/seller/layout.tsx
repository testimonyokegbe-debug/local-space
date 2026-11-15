import SellerNavbar from "@/components/SellerNavbar";

export default function SellerLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <SellerNavbar />
      {children}
    </>
  );
}