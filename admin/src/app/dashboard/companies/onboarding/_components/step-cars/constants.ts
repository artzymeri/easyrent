export const COLOR_OPTIONS = [
  "black", "white", "silver", "gray", "red", "blue",
  "green", "yellow", "orange", "brown", "beige", "gold",
  "maroon", "navy", "purple", "pink",
];

export const STATUS_OPTIONS = [
  { value: "available", label: "Available" },
  { value: "rented", label: "Rented" },
  { value: "maintenance", label: "Maintenance" },
  { value: "out_of_service", label: "Out of Service" },
  { value: "needs_repair", label: "Needs Repair" },
];

export const FUEL_LABELS: Record<string, string> = {
  gasoline: "Gasoline",
  diesel: "Diesel",
  electric: "Electric",
  hybrid: "Hybrid",
  plugin_hybrid: "Plugin Hybrid",
  lpg: "LPG",
};

export const TRANSMISSION_LABELS: Record<string, string> = {
  automatic: "Automatic",
  manual: "Manual",
};
