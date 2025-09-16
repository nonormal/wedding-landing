// src/app/page.tsx
import Navbar from "@/ui/custom/Navbar";
import Hero from "@/components/section/Hero";
import Intro from "@/components/section/Intro";
import InfoCards from "@/components/section/InfoCards";
import GalleryMasonry from "@/components/gallery/GalleryMasonry";
import Testimonials from "@/components/section/Testimonials";
import CTA from "@/components/section/CTA";
import Footer from "@/ui/custom/Footer";
import Gallery from "@/components/gallery/Gallery";

export const dynamic = "force-static"; // hoặc: export const revalidate = 3600;

export default function Page() {
    return (
        <>
            <Navbar />
            <main className="bg-gradient-to-b from-white to-[#FAF6F2] text-[#2A2A2A]">
                <Hero />
                <Intro />
                <InfoCards />
                <GalleryMasonry />
                <Gallery />
                <Testimonials />
                <CTA />
                <Footer />
            </main>
        </>
    );
}
