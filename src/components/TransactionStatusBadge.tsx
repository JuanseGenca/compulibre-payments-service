import { TransactionStatus } from "@prisma/client";

interface BadgeProps {
  status: TransactionStatus | string;
}

export function TransactionStatusBadge({ status }: BadgeProps) {
  let baseClasses = "px-2 py-1 rounded-full text-xs font-medium ";

  if (status === 'PAID') {
    baseClasses += "bg-green-100 text-green-700";
  } else if (status === 'PENDING') {
    baseClasses += "bg-yellow-100 text-yellow-700";
  } else {
    // FAILED, REJECTED, etc.
    baseClasses += "bg-red-100 text-red-700";
  }

  return (
    <span className={baseClasses}>
      {status}
    </span>
  );
}
