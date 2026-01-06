export const formatCurrency = (value) => {
  const formatted = new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
  }).format(value);

  // Intl for id-ID often uses a non‑breaking space after 'Rp'.
  // Normalize to keep UI and tests consistent: 'Rp1.000' instead of 'Rp 1.000'.
  return formatted.replace(/^Rp[\s\u00A0]+/u, "Rp");
};

export const formatNumber = (value) => {
  return new Intl.NumberFormat("id-ID").format(value);
};

export const formatDate = (date, format = "dd/MM/yyyy") => {
  if (!date) return "-";
  const d = new Date(date);
  const day = String(d.getDate()).padStart(2, "0");
  const month = String(d.getMonth() + 1).padStart(2, "0");
  const year = d.getFullYear();

  switch (format) {
    case "dd/MM/yyyy":
      return `${day}/${month}/${year}`;
    case "yyyy-MM-dd":
      return `${year}-${month}-${day}`;
    case "dd MMM yyyy":
      const months = [
        "Jan",
        "Feb",
        "Mar",
        "Apr",
        "Mei",
        "Jun",
        "Jul",
        "Ags",
        "Sep",
        "Okt",
        "Nov",
        "Des",
      ];
      return `${day} ${months[d.getMonth()]} ${year}`;
    default:
      return `${day}/${month}/${year}`;
  }
};

export const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const generateCode = (prefix, number) => {
  return `${prefix}${String(number).padStart(4, "0")}`;
};

export const calculateSubtotal = (quantity, price, discount = 0) => {
  const subtotal = quantity * price;
  return subtotal - (subtotal * discount) / 100;
};

export const validateForm = (values, rules) => {
  const errors = {};

  Object.keys(rules).forEach((field) => {
    const rule = rules[field];
    const value = values[field];

    if (rule.required && !value) {
      errors[field] = `${rule.label || field} wajib diisi`;
    }

    if (rule.min && value < rule.min) {
      errors[field] = `${rule.label || field} minimal ${rule.min}`;
    }

    if (rule.max && value > rule.max) {
      errors[field] = `${rule.label || field} maksimal ${rule.max}`;
    }

    if (rule.pattern && !rule.pattern.test(value)) {
      errors[field] = rule.message || `${rule.label || field} tidak valid`;
    }
  });

  return errors;
};

export const generateTransactionNumber = (prefix, date = new Date()) => {
  const normalizedPrefix = String(prefix || "TRX")
    .toUpperCase()
    .trim();

  const dateStr =
    typeof date === "string" ? date : new Date(date).toISOString().slice(0, 10);

  const yyyymmdd = dateStr.replaceAll("-", "");
  const displayDate =
    normalizedPrefix === "PO" || normalizedPrefix === "SL"
      ? yyyymmdd.slice(2) // YYMMDD
      : yyyymmdd; // YYYYMMDD
  const key = `inv:${normalizedPrefix}:${yyyymmdd}`;

  let storage;
  try {
    storage = globalThis?.localStorage || globalThis?.window?.localStorage;
  } catch {
    storage = undefined;
  }

  let next = 1;
  try {
    const lastRaw = storage?.getItem?.(key);
    const last = parseInt(lastRaw || "0", 10);
    next = Number.isFinite(last) ? last + 1 : 1;
    storage?.setItem?.(key, String(next));
  } catch {
    // Fallback: keep next=1 if storage unavailable.
  }

  return `${normalizedPrefix}-${displayDate}-${String(next).padStart(4, "0")}`;
};
