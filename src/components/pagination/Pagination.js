import React from "react";
import { blueColor } from "../../global";
import "./Pagination.scss";

export const Pagination = ({ page = 1, lastPage = 1, onPageChange, className = "pagination", buttonClassName = "pagination__btn", prevLabel = "Anterior", nextLabel = "Siguiente", disabled = false }) => {
  const prevDisabled = disabled || page <= 1;
  const nextDisabled = disabled || page >= lastPage;
  const lastDisabled = disabled || page >= lastPage;

  const handlePrev = () => { if (!prevDisabled && typeof onPageChange === "function") onPageChange(page - 1); };
  const handleNext = () => { if (!nextDisabled && typeof onPageChange === "function") onPageChange(page + 1); };
  const handleGoLast = () => { if (!lastDisabled && typeof onPageChange === "function") onPageChange(lastPage); };

  return (
    <div className={className}>
      <button className={buttonClassName} disabled={prevDisabled} onClick={handlePrev} aria-label="Anterior"><span>{prevLabel}</span></button>
      <span className="pagination__info">
        Página {page} de{" "}
        <button type="button" onClick={handleGoLast} disabled={lastDisabled} aria-label="Ir a la última página" className="pagination__last">
          {lastPage}
        </button>
      </span>
      <button className={buttonClassName} disabled={nextDisabled} onClick={handleNext} aria-label="Siguiente"><span>{nextLabel}</span></button>
    </div>
  );
};

export default Pagination;
