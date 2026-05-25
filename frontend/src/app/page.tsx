import Link from "next/link";
import { Button } from "@/components/ui/button";
import { TrendingRecommendations } from "@/components/recommendations/TrendingRecommendations";
import { ArrowRight, ShoppingBag } from "lucide-react";

export default function Home() {
  return (
    <div className="flex flex-col gap-16 pb-16">
      <section className="flex flex-col items-center justify-center min-h-[60vh] text-center pt-10">
        <div className="inline-flex items-center rounded-full border px-2.5 py-0.5 text-xs font-semibold transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 mb-6 bg-primary/10 text-primary border-primary/20">
          Nuevas colecciones disponibles
        </div>
        <h1 className="text-4xl font-extrabold tracking-tight lg:text-6xl mb-6 max-w-4xl bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
          El futuro del comercio electrónico está aquí
        </h1>
        <p className="text-xl text-muted-foreground max-w-[600px] mb-10">
          Descubre productos increíbles con recomendaciones inteligentes impulsadas por Inteligencia Artificial.
        </p>
        <div className="flex flex-col sm:flex-row gap-4">
          <Link href="/products">
            <Button size="lg" className="h-12 px-8 text-base group">
              <ShoppingBag className="mr-2 h-5 w-5" />
              Explorar Catálogo
              <ArrowRight className="ml-2 h-5 w-5 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
          <Link href="/register">
            <Button variant="outline" size="lg" className="h-12 px-8 text-base">
              Crear cuenta gratis
            </Button>
          </Link>
        </div>
      </section>

      <section className="container mx-auto max-w-7xl">
        <TrendingRecommendations />
      </section>
    </div>
  );
}
