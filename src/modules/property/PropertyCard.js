import { api } from '../../services/api/api.js';

const propertImageEndpoint = process.env.REACT_APP_ENDPOINT_PROPERTYIMAGE;

export const PropertyCard = ({ property, onClick }) => {
  const { propertyImage, loadingImage } = api.get(property.idProperty ? `${propertImageEndpoint}/?IdProperty=${property.idProperty}` : null)
  
  return (
    <div className="index-property-card" onClick={onClick}>
      {loadingImage || !propertyImage ? (
        <div className="container-loader">
          <div className="spinner"></div>
        </div>
      ) : propertyImage.length > 0 ? (
        <img
          className="index-property-card-img"
          src={`data:image/jpg;base64,${propertyImage[0].file}`}
          alt={property.name}
          loading="lazy"
        />
      ) : (
        <div className="container-loader">
          <div className="spinner"></div>
        </div>
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
