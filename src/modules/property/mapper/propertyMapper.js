// Normaliza PropertyDto del backend → formato frontend (camelCase)
export const normalizeProperty = (data = {}) => ({
  idProperty: data?.idProperty ?? data?.IdProperty ?? "",
  name: data?.name ?? data?.Name ?? "",
  address: data?.address ?? data?.Address ?? "",
  price: data?.price ?? data?.Price ?? 0,
  codeInternal: data?.codeInternal ?? data?.CodeInternal ?? 0,
  year: data?.year ?? data?.Year ?? 0,
  idOwner: data?.idOwner ?? data?.IdOwner ?? "",
  // Propietario (embebido)
  owner: data?.owner ?? data?.Owner
    ? {
        idOwner: data?.owner?.idOwner ?? data?.Owner?.IdOwner ?? "",
        name: data?.owner?.name ?? data?.Owner?.Name ?? "",
        address: data?.owner?.address ?? data?.Owner?.Address ?? "",
        photo: data?.owner?.photo ?? data?.Owner?.Photo ?? "",
        birthday: data?.owner?.birthday ?? data?.Owner?.Birthday ?? "",
      }
    : null,
  // Imagen (embebida)
  image: data?.image ?? data?.Image
    ? {
        idPropertyImage: data?.image?.idPropertyImage ?? data?.Image?.IdPropertyImage ?? "",
        idProperty: data?.image?.idProperty ?? data?.Image?.IdProperty ?? "",
        file: data?.image?.file ?? data?.Image?.File ?? "",
        enabled: data?.image?.enabled ?? data?.Image?.Enabled ?? true,
      }
    : null,
  // Trazas (embebidas)
  traces: Array.isArray(data?.traces ?? data?.Traces)
    ? (data.traces ?? data.Traces).map(trace => ({
        idPropertyTrace: trace?.idPropertyTrace ?? trace?.IdPropertyTrace ?? "",
        idProperty: trace?.idProperty ?? trace?.IdProperty ?? "",
        dateSale: trace?.dateSale ?? trace?.DateSale ?? "",
        name: trace?.name ?? trace?.Name ?? "",
        value: trace?.value ?? trace?.Value ?? 0,
        tax: trace?.tax ?? trace?.Tax ?? 0,
      }))
    : [],
});

// Mapea Property del frontend → formato backend (camelCase compatible con .NET)
export const mapPropertyToDto = (property = {}) => ({
  idProperty: property?.idProperty ?? "",
  name: property?.name ?? "",
  address: property?.address ?? "",
  price: property?.price ?? 0,
  codeInternal: property?.codeInternal ?? 0,
  year: property?.year ?? 0,
  idOwner: property?.idOwner ?? "",
  // Propietario
  owner: property?.owner
    ? {
        idOwner: property.owner.idOwner ?? "",
        name: property.owner.name ?? "",
        address: property.owner.address ?? "",
        photo: property.owner.photo ?? "",
        birthday: property.owner.birthday ?? "",
      }
    : undefined,
  // Imagen
  image: property?.image
    ? {
        idPropertyImage: property.image.idPropertyImage ?? "",
        idProperty: property.image.idProperty ?? "",
        file: property.image.file ?? "",
        enabled: property.image.enabled ?? true,
      }
    : undefined,
  // Trazas
  traces: Array.isArray(property?.traces)
    ? property.traces.map(trace => ({
        idPropertyTrace: trace.idPropertyTrace ?? "",
        idProperty: trace.idProperty ?? "",
        dateSale: trace.dateSale ?? "",
        name: trace.name ?? "",
        value: trace.value ?? 0,
        tax: trace.tax ?? 0,
      }))
    : [],
});
