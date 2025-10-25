export const PropertyCard = ({ property, onClick }) => {
  const imageFile = property?.image?.file;

  return (
    <div className="index-property-card" onClick={onClick}>
      {imageFile ? (
        <img
          className="index-property-card-img"
          src={`data:image/jpg;base64,${imageFile}`}
          alt={property.name}
          loading="lazy"
        />
      ) : (
        <div className="no-image">Sin imagen</div>
      )}

      <div className="index-property-card-info">
        <h3>{property.name}</h3>
        <p>{property.address}</p>
        <p className="price">${property.price.toLocaleString()}</p>
      </div>
    </div>
  );
};

export default PropertyCard;
