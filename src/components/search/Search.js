import { memo, useEffect, useRef, useState } from "react";
import { TextField, Button, Box, Paper, MenuItem } from "@mui/material";
import { FiSearch, FiMapPin, FiDollarSign, FiFilter, FiX, FiRotateCcw } from "react-icons/fi";
import { MAX_PRICE, orangeColor, STEP } from "../../global";
import "./Search.scss";

const formatShort = (v) => (v >= 1_000_000 ? `${Math.round(v / 1_000_000)} M` : `$ ${v.toLocaleString()}`);

export const Search = ({ filters = {}, onChange, className = "" }) => {
  const didInit = useRef(false);
  const trackRef = useRef(null);
  const [name, setName] = useState(filters.name || "");
  const [address, setAddress] = useState(filters.address || "");
  const [min, setMin] = useState(filters.minPrice !== undefined ? Number(filters.minPrice) : 0);
  const [max, setMax] = useState(filters.maxPrice !== undefined ? Number(filters.maxPrice) : MAX_PRICE);
  const [open, setOpen] = useState(false);
  const cleanup = useRef(null);

  useEffect(() => {
    if (!didInit.current) didInit.current = true;
    return () => { if (cleanup.current) clearTimeout(cleanup.current); };
  }, []);

  const isDirty = !!name || !!address || min > 0 || max < MAX_PRICE;
  const build = () => ({ name, address, minPrice: min, maxPrice: max });

  const apply = () => { if (typeof onChange === "function") onChange(build()); setOpen(false); };
  const clear = () => {
    setName(""); setAddress(""); setMin(0); setMax(MAX_PRICE);
    if (typeof onChange === "function") onChange({ name: "", address: "", minPrice: 0, maxPrice: MAX_PRICE });
  };
  const toggle = () => setOpen((v) => !v);

  const onMinRange = (val) => {
    const v = Math.min(Math.max(0, Number(val)), MAX_PRICE);
    if (v >= max) return;
    setMin(v);
  };
  const onMaxRange = (val) => {
    const v = Math.min(Math.max(0, Number(val)), MAX_PRICE);
    if (v <= min) return;
    setMax(v);
  };

  // click en la línea → mueve el handle más cercano
  const handleTrackClick = (e) => {
    if (!trackRef.current) return;
    const rect = trackRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    let pct = x / rect.width;
    pct = Math.min(Math.max(pct, 0), 1);
    let value = Math.round((pct * MAX_PRICE) / STEP) * STEP;
    const distMin = Math.abs(value - min);
    const distMax = Math.abs(value - max);

    if (distMin <= distMax) {
      // mover min
      let nextMin = Math.min(value, max - STEP);
      if (nextMin < 0) nextMin = 0;
      setMin(nextMin);
    } else {
      // mover max
      let nextMax = Math.max(value, min + STEP);
      if (nextMax > MAX_PRICE) nextMax = MAX_PRICE;
      setMax(nextMax);
    }
  };

  return (
    <div className={`searchbar ${className}`.trim()}>
      <button type="button" className={`searchbar-toggle ${open ? "is-open" : ""}`} onClick={toggle}>
        <FiFilter className="searchbar-icon" /><span>Filtros</span>
        {isDirty && <small className="searchbar-indicator">aplicados</small>}
        {open && <FiX className="searchbar-toggle-close" />}
      </button>

      <div className={`searchbar-panel ${open ? "is-open" : ""}`}>
        <div className="searchbar-group">
          <div className="searchbar-field">
            <FiSearch className="searchbar-icon" />
            <TextField id="nameSearch" type="text" value={name} onChange={(e) => setName(e.target.value)} label="Nombre" aria-label="name search input"/>
          </div>
          <div className="searchbar-divider" />
          <div className="searchbar-field">
            <FiMapPin className="searchbar-icon" />
            <TextField id="addressSearch" type="text" value={address} onChange={(e) => setAddress(e.target.value)} label="Dirección / sector" aria-label="address search input"/>
          </div>
          <div className="searchbar-divider hide-mobile" />
          <div className="searchbar-field searchbar-price">
            <FiDollarSign strokeWidth={2} className="searchbar-icon" />
            <div className="price-slider" onClick={handleTrackClick}>
              <div className="price-slider-track" ref={trackRef} />
              <div className="price-slider-range" style={{ left: `${(min / MAX_PRICE) * 100}%`, right: `${100 - (max / MAX_PRICE) * 100}%` }} />
              <input id="minRangeLimit" type="range" min="0" max={MAX_PRICE} step={STEP} value={min} onChange={(e) => onMinRange(e.target.value)} aria-label="min range limit"/>
              <input id="maxRangeLimit" type="range" min="0" max={MAX_PRICE} step={STEP} value={max} onChange={(e) => onMaxRange(e.target.value)} aria-label="max range limit"/>
              <div className="price-slider-labels">
                <span>{formatShort(min)}</span>
                <span>{formatShort(max)}</span>
              </div>
            </div>
          </div>
        </div>

        <div className="searchbar-actions">
          <button id="clearButton" type="button" className="searchbar-clear" onClick={clear}><FiRotateCcw color={orangeColor} aria-label="clear button"/><span>Limpiar</span></button>
          <button id="applyButton" type="button" className="searchbar-apply" onClick={apply}><FiFilter color={orangeColor} aria-label="apply button" /><span>Aplicar</span></button>
        </div>
      </div>
    </div>
  );
};

export default memo(Search);
