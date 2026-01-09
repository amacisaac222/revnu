"use client";

import { useState } from "react";
import RecordPaymentModal from "./record-payment-modal";

interface RecordPaymentButtonProps {
  invoiceId: string;
  invoiceNumber: string;
  amountRemaining: number;
  isPaid: boolean;
}

export default function RecordPaymentButton({
  invoiceId,
  invoiceNumber,
  amountRemaining,
  isPaid,
}: RecordPaymentButtonProps) {
  const [showModal, setShowModal] = useState(false);

  if (isPaid) {
    return null;
  }

  return (
    <>
      <button
        onClick={() => setShowModal(true)}
        className="px-4 py-2 bg-gradient-to-r from-revnu-green to-revnu-greenDark text-revnu-dark font-black rounded-lg hover:from-revnu-greenLight hover:to-revnu-green transition shadow-lg shadow-revnu-green/20 text-center"
      >
        Record Payment
      </button>

      {showModal && (
        <RecordPaymentModal
          invoiceId={invoiceId}
          invoiceNumber={invoiceNumber}
          amountRemaining={amountRemaining}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
}
