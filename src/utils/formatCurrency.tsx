export const parseNumber = (value: string | number): number => {
    if (typeof value === "string") {
      // Ubah titik menjadi kosong, dan koma menjadi titik (untuk format Indonesia)
      return parseFloat(value.replace(/\./g, "").replace(",", "."));
    }
    return value;
  };
  
export const formatRupiah = (price: string | number): string => {
    const numberPrice = parseNumber(price);
    return numberPrice.toLocaleString("id-ID", {
      style: "currency",
      currency: "IDR",
      minimumFractionDigits: 2,
      maximumFractionDigits: 2,
    });
  };
  