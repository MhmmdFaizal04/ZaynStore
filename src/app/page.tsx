import Header from '@/components/Header'
import Hero from '@/components/Hero'
import ProductGrid from '@/components/ProductGrid'
import Footer from '@/components/Footer'

export default function HomePage() {
  return (
    <main className="min-h-screen bg-gray-50">
      <Header />
      <Hero />
      <section className="py-8 sm:py-12 lg:py-16">
        <div className="container mx-auto px-4 sm:px-6 lg:px-8">
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-serif font-bold text-center mb-8 sm:mb-12 text-gray-900">
            Produk Digital Terbaru
          </h2>
          <ProductGrid />
        </div>
      </section>
      <Footer />
    </main>
  )
}
