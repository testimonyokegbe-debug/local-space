import Greeting from "./get started";
import MarketPlace from "./market";
import Testimonials from "./testimonials";
import Contact from "./contact";

export default function CustomerMainPage() {
  return (
    <main className="min-h-[70vh]">
    <section id="get-started" className="mx-auto max-w-6xl scroll-mt-24 px-6 py-16">
  <Greeting name="Testimony" />
        <div id="market" className="mt-10 scroll-mt-24">
            <MarketPlace />
          </div>
        <div id="testimonials" className="mt-16 scroll-mt-24">
            <Testimonials />
          </div>
          <div id="contact" className="mt-16 scroll-mt-24">
            <Contact />
          </div>
      </section>
    </main>
  );
}