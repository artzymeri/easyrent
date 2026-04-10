"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/lib/api";
import { useTranslation } from "@/lib/i18n";
import { useCurrency } from "@/lib/currency-context";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Spinner } from "@/components/ui/spinner";
import { ArrowLeft } from "lucide-react";
import type { CarDetail } from "./_components/types";
import { ImageGallery } from "./_components/image-gallery";
import { CarInfoPanel } from "./_components/car-info-panel";
import { CarDetailCards } from "./_components/car-detail-cards";

export default function CarDetailPage() {
  const params = useParams();
  const router = useRouter();
  const { t } = useTranslation();
  const { fc } = useCurrency();
  const [car, setCar] = useState<CarDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeImage, setActiveImage] = useState(0);

  useEffect(() => {
    const fetchCar = async () => {
      try {
        const data = await api.get<CarDetail>(`/cars/${params.id}`);
        setCar(data);
        const primaryIdx = data.images?.findIndex((img) => img.isPrimary) ?? 0;
        setActiveImage(primaryIdx >= 0 ? primaryIdx : 0);
      } catch {
        toast.error(t("carDetail.failedLoad"));
        router.push("/dashboard/cars");
      } finally {
        setLoading(false);
      }
    };
    fetchCar();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [params.id]);

  const handleDelete = async () => {
    if (!confirm(t("common.confirmDelete"))) return;
    try {
      await api.delete(`/cars/${params.id}`);
      toast.success(t("common.deleted"));
      router.push("/dashboard/cars");
    } catch {
      toast.error(t("common.failedDelete"));
    }
  };

  if (loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  if (!car) return null;

  return (
    <div className="mx-auto max-w-6xl space-y-6">
      {/* ── Back button ──────────────────────────────────────── */}
      <Button
        variant="ghost"
        size="sm"
        className="gap-1.5 text-muted-foreground hover:text-foreground"
        onClick={() => router.push("/dashboard/cars")}
      >
        <ArrowLeft className="h-4 w-4" />
        {t("common.back")}
      </Button>

      {/* ── Hero section: Image + Info side-by-side ──────────── */}
      <div className="grid gap-6 lg:grid-cols-5">
        <ImageGallery
          images={car.images || []}
          activeImage={activeImage}
          setActiveImage={setActiveImage}
          carName={`${car.make} ${car.model}`}
          noImagesLabel={t("carDetail.noImages")}
        />

        <CarInfoPanel car={car} t={t} fc={fc} onDelete={handleDelete} />
      </div>

      <CarDetailCards car={car} t={t} />
    </div>
  );
}
