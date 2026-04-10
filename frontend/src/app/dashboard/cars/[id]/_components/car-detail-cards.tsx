"use client";

import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Wrench,
  Info,
  FileText,
  Clock,
  Download,
  QrCode,
  AlertTriangle,
} from "lucide-react";
import type { CarDetail } from "./types";
import { isExpiringSoon, isExpired } from "./types";

interface CarDetailCardsProps {
  car: CarDetail;
  t: (key: string) => string;
}

export function CarDetailCards({ car, t }: CarDetailCardsProps) {
  return (
    <>
      {/* ── Bottom grid: additional details ─────────────────── */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {/* Registration & Insurance */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Shield className="h-4 w-4 text-primary" />
              {t("carDetail.insurance")}
            </h3>
            <div className="space-y-3">
              <InfoRow
                label={t("carDetail.registrationExpiry")}
                value={car.registrationExpiry || "—"}
                warn={car.registrationExpiry ? isExpiringSoon(car.registrationExpiry) : false}
                expired={car.registrationExpiry ? isExpired(car.registrationExpiry) : false}
              />
              <Separator />
              <InfoRow label={t("carDetail.insuranceProvider")} value={car.insuranceProvider || "—"} />
              <Separator />
              <InfoRow label={t("carDetail.policyNumber")} value={car.insurancePolicyNumber || "—"} />
              <Separator />
              <InfoRow
                label={t("carDetail.insuranceExpiry")}
                value={car.insuranceExpiry || "—"}
                warn={car.insuranceExpiry ? isExpiringSoon(car.insuranceExpiry) : false}
                expired={car.insuranceExpiry ? isExpired(car.insuranceExpiry) : false}
              />
            </div>
          </CardContent>
        </Card>

        {/* Service info */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Wrench className="h-4 w-4 text-primary" />
              {t("carDetail.service")}
            </h3>
            <div className="space-y-3">
              <InfoRow label={t("carDetail.lastService")} value={car.lastServiceDate || "—"} />
              <Separator />
              <InfoRow
                label={t("carDetail.nextService")}
                value={car.nextServiceDate || "—"}
                warn={car.nextServiceDate ? isExpiringSoon(car.nextServiceDate) : false}
              />
              <Separator />
              <InfoRow
                label={t("carDetail.nextServiceMileage")}
                value={car.nextServiceMileage ? `${car.nextServiceMileage.toLocaleString()} km` : "—"}
              />
            </div>
          </CardContent>
        </Card>

        {/* Meta info + QR */}
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <Info className="h-4 w-4 text-primary" />
              {t("carDetail.specifications")}
            </h3>
            <div className="space-y-3">
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Clock className="h-4 w-4" />
                {t("carDetail.addedOn")}{" "}
                <span className="font-medium text-foreground">
                  {new Date(car.createdAt).toLocaleDateString()}
                </span>
              </div>
            </div>

            {car.qrCode && (
              <div className="mt-5 pt-4 border-t">
                <div className="flex items-center gap-2 mb-3 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  <QrCode className="h-4 w-4 text-primary" />
                  {t("carDetail.qrCode")}
                </div>
                <div className="flex flex-col items-center gap-2">
                  <img src={car.qrCode} alt="QR Code" className="h-36 w-36 rounded-lg border p-1" />
                  <p className="text-center text-xs text-muted-foreground">
                    {t("carDetail.qrCodeHint")}
                  </p>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* ── Notes ────────────────────────────────────────────── */}
      {car.notes && (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-4 w-4 text-primary" />
              {t("carDetail.notes")}
            </h3>
            <p className="whitespace-pre-wrap text-sm leading-relaxed text-muted-foreground">
              {car.notes}
            </p>
          </CardContent>
        </Card>
      )}

      {/* ── Repair Parts ─────────────────────────────────────── */}
      {car.status === "needs_repair" && car.repairParts && car.repairParts.length > 0 && (
        <Card className="border-orange-200 bg-orange-50/30">
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-orange-600">
              <Wrench className="h-4 w-4" />
              {t("carsPage.repairParts")}
            </h3>
            <div className="flex flex-wrap gap-2">
              {car.repairParts.map((part) => (
                <Badge key={part} variant="outline" className="border-orange-300 bg-white text-orange-700">
                  {t(`carsPage.repairPartsList.${part}`)}
                </Badge>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Documents ─────────────────────────────────────────── */}
      {car.documents && car.documents.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <FileText className="h-4 w-4 text-primary" />
              {t("carDocuments.title")}
              <Badge variant="secondary" className="ml-1 text-xs">
                {car.documents.length}
              </Badge>
            </h3>
            <div className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
              {car.documents
                .sort((a, b) => a.sortOrder - b.sortOrder)
                .map((doc) => (
                  <a
                    key={doc.id}
                    href={doc.url}
                    download={doc.name}
                    className="flex items-center gap-3 rounded-lg border p-3 transition-colors hover:bg-muted/50"
                  >
                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-muted">
                      <FileText className="h-4 w-4 text-muted-foreground" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium">{doc.name}</p>
                      <p className="text-[11px] text-muted-foreground uppercase">
                        {doc.type.split("/").pop()}
                      </p>
                    </div>
                    <Download className="h-4 w-4 shrink-0 text-muted-foreground" />
                  </a>
                ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* ── Damages ──────────────────────────────────────────── */}
      {car.damages && car.damages.length > 0 && (
        <Card>
          <CardContent className="p-5">
            <h3 className="mb-4 flex items-center gap-2 text-sm font-semibold uppercase tracking-wider text-muted-foreground">
              <AlertTriangle className="h-4 w-4 text-amber-500" />
              {t("carDetail.damages")}
              <Badge variant="secondary" className="ml-1 text-xs">
                {car.damages.length}
              </Badge>
            </h3>
            <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
              {car.damages.map((d) => (
                <div
                  key={d.id}
                  className="rounded-xl border p-4 transition-colors hover:bg-muted/30"
                >
                  <div className="flex items-center gap-2 mb-2">
                    <div
                      className={`h-2.5 w-2.5 shrink-0 rounded-full ${
                        d.severity === "major"
                          ? "bg-red-500"
                          : d.severity === "moderate"
                            ? "bg-amber-500"
                            : "bg-blue-500"
                      }`}
                    />
                    <Badge
                      variant="outline"
                      className={`text-[10px] ${
                        d.severity === "major"
                          ? "border-red-200 bg-red-50 text-red-600"
                          : d.severity === "moderate"
                            ? "border-amber-200 bg-amber-50 text-amber-600"
                            : "border-blue-200 bg-blue-50 text-blue-600"
                      }`}
                    >
                      {d.severity}
                    </Badge>
                  </div>
                  <p className="text-sm font-medium leading-snug">{d.description}</p>
                  <p className="mt-1.5 text-xs text-muted-foreground">
                    {d.location} · {new Date(d.createdAt).toLocaleDateString()}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}
    </>
  );
}

/* ─── Sub-component ───────────────────────────────────────── */

function InfoRow({
  label,
  value,
  warn,
  expired,
}: {
  label: string;
  value: string;
  warn?: boolean;
  expired?: boolean;
}) {
  return (
    <div className="flex items-center justify-between gap-2 text-sm">
      <span className="text-muted-foreground">{label}</span>
      <span className={`text-right font-medium ${expired ? "text-red-600" : warn ? "text-amber-600" : ""}`}>
        {value}
      </span>
    </div>
  );
}
