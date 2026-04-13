"use client";

import { Suspense } from "react";
import { useTranslation } from "@/lib/i18n";
import { CalendarDays, List } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Spinner } from "@/components/ui/spinner";
import { CustomerCreateSheet } from "@/components/customer-create-sheet";

import { BookingCalendar } from "./_components/booking-calendar";
import { BookingDetailSheet } from "./_components/booking-detail-sheet";
import { StartBookingDialog } from "./_components/start-booking-dialog";
import { CompleteBookingDialog } from "./_components/complete-booking-dialog";
import { NewBookingSheet } from "./_components/new-booking-sheet";
import { RequestInfoDialog } from "./_components/request-info-dialog";
import { BookingFilters } from "./_components/booking-filters";
import { BookingListView } from "./_components/booking-list-view";
import { useBookings } from "./_components/use-bookings";

function BookingsPageContent() {
  const { t } = useTranslation();
  const b = useBookings();

  if (b.loading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <Spinner className="h-8 w-8" />
      </div>
    );
  }

  return (
    <div className="space-y-4 sm:space-y-6">
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">{t("bookingsPage.title")}</h1>
          <p className="text-sm text-muted-foreground sm:text-base">
            {t("bookingsPage.subtitle", { count: String(b.bookings.length) })}
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <div className="flex rounded-lg border">
            <Button
              variant={b.view === "calendar" ? "default" : "ghost"}
              size="sm"
              onClick={() => b.setView("calendar")}
            >
              <CalendarDays className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">{t("bookingsPage.calendarView")}</span>
              <span className="sm:hidden">Cal</span>
            </Button>
            <Button
              variant={b.view === "list" ? "default" : "ghost"}
              size="sm"
              onClick={() => b.setView("list")}
            >
              <List className="mr-1.5 h-4 w-4" />
              <span className="hidden sm:inline">{t("bookingsPage.listView")}</span>
              <span className="sm:hidden">List</span>
            </Button>
          </div>
          <Button onClick={() => b.setDialogOpen(true)} className="flex-1 sm:flex-none">
            {t("bookingsPage.newBooking")}
          </Button>
        </div>
      </div>

      <BookingFilters
        customers={b.customers}
        filterCustomerId={b.filterCustomerId}
        setFilterCustomerId={b.setFilterCustomerId}
        filterFrom={b.filterFrom}
        setFilterFrom={b.setFilterFrom}
        filterTo={b.filterTo}
        setFilterTo={b.setFilterTo}
        hasActiveFilters={b.hasActiveFilters}
        onClearFilters={b.clearFilters}
      />

      {b.view === "calendar" && (
        <BookingCalendar
          bookings={b.bookings}
          calYear={b.calYear}
          calMonth={b.calMonth}
          setCalYear={b.setCalYear}
          setCalMonth={b.setCalMonth}
          onSelectBooking={b.handleSelectBooking}
        />
      )}

      <BookingDetailSheet
        open={b.sheetOpen}
        onOpenChange={b.setSheetOpen}
        booking={b.selectedBooking}
        generatingReport={b.generatingReport}
        sendingEmail={b.sendingEmail}
        onDownloadReport={b.handleDownloadReport}
        onSendEmail={b.handleSendEmail}
        onDeleteBooking={b.handleDeleteBooking}
        onStartBooking={b.handleStartBooking}
        onCompleteBooking={b.handleCompleteBooking}
        onUpdateStatus={b.updateStatus}
      />

      <StartBookingDialog
        open={b.startDialogOpen}
        onOpenChange={b.setStartDialogOpen}
        booking={b.startingBooking}
        preStartImages={b.preStartImages}
        onImagesChange={b.setPreStartImages}
        saving={b.startingSaving}
        onConfirm={b.handleConfirmStart}
        onClose={() => { b.setStartDialogOpen(false); }}
      />

      <CompleteBookingDialog
        open={b.completeDialogOpen}
        onOpenChange={b.setCompleteDialogOpen}
        booking={b.completingBooking}
        bookingFull={b.completingBookingFull}
        settlementStep={b.settlementStep}
        setSettlementStep={b.setSettlementStep}
        settleMileageIn={b.settleMileageIn}
        setSettleMileageIn={b.setSettleMileageIn}
        settleExtraCharges={b.settleExtraCharges}
        setSettleExtraCharges={b.setSettleExtraCharges}
        settlePaymentAmount={b.settlePaymentAmount}
        setSettlePaymentAmount={b.setSettlePaymentAmount}
        saving={b.completeSaving}
        onConfirm={b.handleConfirmComplete}
        onClose={() => { b.setCompleteDialogOpen(false); }}
      />

      <CustomerCreateSheet
        open={b.quickCustomerOpen}
        onOpenChange={b.setQuickCustomerOpen}
        onCreated={(created) => {
          b.setCustomers((prev) => [...prev, { id: created.id, firstName: created.firstName, lastName: created.lastName, phone: created.phone }]);
          b.setForm((prev) => ({ ...prev, customerId: String(created.id) }));
        }}
        prefill={b.customerPrefill}
      />

      {b.view === "list" && (
        <BookingListView
          bookings={b.bookings}
          hasActiveFilters={b.hasActiveFilters}
          onSelectBooking={b.handleSelectBooking}
          onDownloadReport={b.handleDownloadReport}
          onStartBooking={b.handleStartBooking}
          onCompleteBooking={b.handleCompleteBooking}
          onUpdateStatus={b.updateStatus}
          onDeleteBooking={b.handleDeleteBooking}
        />
      )}

      <NewBookingSheet
        open={b.dialogOpen}
        onOpenChange={b.setDialogOpen}
        form={b.form}
        setForm={b.setForm}
        cars={b.cars}
        customers={b.customers}
        deliveryPoints={b.deliveryPoints}
        saving={b.saving}
        onSubmit={b.handleCreate}
        onClose={() => b.setDialogOpen(false)}
        pendingRequestId={b.pendingRequestId}
        pendingRequestInfo={b.pendingRequestInfo}
        onRequestInfoOpen={() => b.setRequestInfoOpen(true)}
        pickupCustom={b.pickupCustom}
        setPickupCustom={b.setPickupCustom}
        returnCustom={b.returnCustom}
        setReturnCustom={b.setReturnCustom}
        onQuickCustomerOpen={() => {
          if (b.pendingRequestInfo) {
            b.setCustomerPrefill({
              firstName: b.pendingRequestInfo.requesterFirstName,
              lastName: b.pendingRequestInfo.requesterLastName,
              email: b.pendingRequestInfo.requesterEmail || "",
              phone: b.pendingRequestInfo.requesterPhone,
            });
          } else {
            b.setCustomerPrefill(null);
          }
          b.setQuickCustomerOpen(true);
        }}
      />

      <RequestInfoDialog
        open={b.requestInfoOpen}
        onOpenChange={b.setRequestInfoOpen}
        info={b.pendingRequestInfo}
      />
    </div>
  );
}

export default function BookingsPage() {
  return (
    <Suspense>
      <BookingsPageContent />
    </Suspense>
  );
}
