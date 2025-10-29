import React from 'react';
import { primaryColor } from '../../global';

export const Pagination = ({
  page = 1,
  lastPage = 1,
  onPageChange,
  className = 'index-pagination',
  buttonClassName = 'index-page-btn',
  prevLabel = 'Anterior',
  nextLabel = 'Siguiente',
  disabled = false,
}) => {
  const prevDisabled = disabled || page <= 1;
  const nextDisabled = disabled || page >= lastPage;
  const lastDisabled = disabled || page >= lastPage;

  const handlePrev = () => {
    if (!prevDisabled && typeof onPageChange === 'function') {
      onPageChange(page - 1);
    }
  };

  const handleNext = () => {
    if (!nextDisabled && typeof onPageChange === 'function') {
      onPageChange(page + 1);
    }
  };

  const handleGoLast = () => {
    if (!lastDisabled && typeof onPageChange === 'function') {
      onPageChange(lastPage);
    }
  };

  return (
    <div className={className}>
      <button
        className={buttonClassName}
        disabled={prevDisabled}
        onClick={handlePrev}
        aria-label="Anterior"
      >
        <span>{prevLabel}</span>
      </button>
      <span>
        Página {page} de{' '}
        <button
          type="button"
          onClick={handleGoLast}
          disabled={lastDisabled}
          aria-label="Ir a la última página"
          style={{
            color: primaryColor,
            textDecoration: 'none',
            background: 'transparent',
            border: 'none',
            padding: 0,
            margin: 0,
            fontSize: 'inherit',
            fontWeight: 600,
            cursor: lastDisabled ? 'default' : 'pointer',
          }}
        >
          {lastPage}
        </button>
      </span>
      <button
        className={buttonClassName}
        disabled={nextDisabled}
        onClick={handleNext}
        aria-label="Siguiente"
      >
        <span>{nextLabel}</span>
      </button>
    </div>
  );
};

export default Pagination;

