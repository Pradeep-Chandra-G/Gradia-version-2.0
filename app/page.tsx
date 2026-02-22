import Hero from "@/components/home/Hero";
import HomeNavbar from "@/components/home/Navbar";

export default function Home() {
  return (
    <main className="min-h-screen">
      <div className="p-8 md:p-16 flex flex-col">
        <HomeNavbar />
        <Hero />
      </div>
    </main>
  );
}
