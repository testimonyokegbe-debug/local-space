import Footer from "@/components/footer";

export default function MainLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-screen flex-col">
      <main className="flex-1 bg-[#1e1b4b]">{children}</main>
      <Footer />
    </div>
  );
}