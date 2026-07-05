import { statusColors, type StatusKey } from "@job-tracker/design-tokens";
import { Badge } from "../../atoms/badge/badge";

const statusLabels: Record<StatusKey, string> = {
  to_contact: "À contacter",
  offer_open: "Offre ouverte",
  application_sent: "Candidature envoyée",
  follow_up_sent: "Relance envoyée",
  hr_interview: "Entretien RH",
  technical_interview: "Entretien technique",
  offer_received: "Offre reçue",
  rejected: "Refusé",
  on_hold: "En pause",
  withdrawn: "Abandonné",
};

export type StatusBadgeProps = {
  status: StatusKey;
};

export function StatusBadge({ status }: StatusBadgeProps) {
  const tokens = statusColors[status];

  return (
    <Badge textColor={tokens.text} backgroundColor={tokens.bg} borderColor={tokens.border} dotColor={tokens.dot}>
      {statusLabels[status]}
    </Badge>
  );
}
