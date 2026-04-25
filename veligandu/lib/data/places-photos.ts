// Real Veligandu Island Resort photos from Google Places (fetched April 2025)
export const VELIGANDU_PHOTOS: string[] = [
  "https://lh3.googleusercontent.com/places/ANXAkqE-K0E7FqXZiimT71mUNuRYKokrRTx1MsTObRhxYjKqw3YIVPSF1wQZ6CnPCM8KXU_gKIVpYJ73JtfY0utYewUF7Xn3Wicu2Pw=s4800-w1560", // 0
  "https://lh3.googleusercontent.com/places/ANXAkqGtbrzWKrQ6sGRq5cgQ9f4aSAPUi5h_Ybf39vqtM1rZ2vpgVvLzBIygpirYLe8O6Sfs6LoVeiP_ksn0-T4iN7MxLe785rP1kpE=s4800-w1560", // 1
  "https://lh3.googleusercontent.com/place-photos/AJRVUZMV99ptpOFJ6TnYNPUAn9SaUTw8F3QG9fFfiQjvETq4JRMrmBUdAGqNA3ljaRUl7MYT4mcEN1znvYC8E4cjGO9BFjCOt31iw_NOH1qYIChBuuBp33Yxrx8y6hngRKumfhQhUcS0XlA6hmbieQ=s4800-w1179", // 2
  "https://lh3.googleusercontent.com/place-photos/AJRVUZMM8lkSES6INMbkRT1Zeg1E9nY8Q1qGFj9Bwb2Xaw1UJrtVgeWHvl_HtB19ER0tUvdu3jbGVi6Xl97PslSqAIbKRoMiwTMOgN0x3Ddi_SqQTOoJ8LDY297wEVVFpA3Vl7P8xQgPrjkroakE=s4800-w1108", // 3
  "https://lh3.googleusercontent.com/places/ANXAkqGrJ5x6y-remtiUtWHud93H5x1kmOrBdkQpgETtXcAp1-Ig9VyP5XTqfwyo0dBdGqwPt_uS1SdeIh7Zy5QN4xEDGYUu0Ama_oQ=s4800-w1600", // 4
  "https://lh3.googleusercontent.com/places/ANXAkqEPqQPyRHjKt3VeND7xvkRtnaFJl_C5zHEf5jE54VL9lYNVUnlFXnVcrWOgD7fLQbDVaTeHUhzxR-gxlp8Fy4lGZMXyOL_QnPk=s4800-w1560", // 5
  "https://lh3.googleusercontent.com/places/ANXAkqFmuJ3JJpa7rZaB9FIibEb01XWNySnIAsKMoj6bu1NwfRVCiL1oE9bYbvsxRw08iAoQc7OM0DoMOWcrnXmnr44YUSqguUfEgDs=s4800-w960",  // 6
  "https://lh3.googleusercontent.com/places/ANXAkqFPZDXIRrdoYGwQgrU4wv4fDAK1xsEJk8L_mgA5RHsy9dHmQEdsygz_dnfbiqgwSEHgvWu0pzqguxMxF_lAv-S02UapyXhNgqQ=s4800-w1600", // 7
  "https://lh3.googleusercontent.com/place-photos/AJRVUZMuHV_W-3JzSJzFKy-m9kujAAEYtD5xXOmqqt5yfyBPHC5m8fs6bU8g477rmBXC2ki77Z2ffvqI3AMN_1oISg1BAAwskzMUE4U9I6VqB_wq3hsrke7CBUJm7txpf_ffXgus_VNDpp7uLvJm=s4800-w1600",  // 8
  "https://lh3.googleusercontent.com/place-photos/AJRVUZNGC0cKSQGA3lcCTskOy-dt8VnumtijVDnTuU2nHOgYDQ9DDY9KJ02e5Sm7qKK5etJiR0O09uHF6K8e-pNV_00iyfHa1YWFeqtaWUglQ09AxEim9VLKBZ7FSZ_PT0Eq4SR4e9ppV2OdH5D0Dus=s4800-w1600", // 9
];

// 3 distinct resort photos assigned to each villa category
export const VILLA_PHOTO_GROUPS: Record<string, string[]> = {
  overwater:         [VELIGANDU_PHOTOS[0], VELIGANDU_PHOTOS[1], VELIGANDU_PHOTOS[4]],
  beach:             [VELIGANDU_PHOTOS[2], VELIGANDU_PHOTOS[3], VELIGANDU_PHOTOS[5]],
  "sunset-overwater":[VELIGANDU_PHOTOS[6], VELIGANDU_PHOTOS[7], VELIGANDU_PHOTOS[8]],
  honeymoon:         [VELIGANDU_PHOTOS[9], VELIGANDU_PHOTOS[0], VELIGANDU_PHOTOS[4]],
};

export function getPlacesPhoto(index: number): string {
  return VELIGANDU_PHOTOS[index % VELIGANDU_PHOTOS.length];
}

export function getVillaPhotos(category: string): string[] {
  return VILLA_PHOTO_GROUPS[category] ?? [VELIGANDU_PHOTOS[0], VELIGANDU_PHOTOS[1], VELIGANDU_PHOTOS[2]];
}
