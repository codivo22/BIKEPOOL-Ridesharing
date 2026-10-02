import { useEffect, useState } from 'react';

export default function LocationInput({ label, value, onChange, required = false }) {
  const [results, setResults] = useState([]);
  const [open, setOpen] = useState(false);

  useEffect(() => {
    const query = value?.label?.trim();
    if (!query || query.length < 3) { setResults([]); return undefined; }
    const timer = setTimeout(async () => {
      try {
        const response = await fetch(`https://nominatim.openstreetmap.org/search?format=jsonv2&limit=4&q=${encodeURIComponent(query)}`);
        setResults(await response.json());
      } catch { setResults([]); }
    }, 500);
    return () => clearTimeout(timer);
  }, [value?.label]);

  const choose = (place) => {
    onChange({ label: place.display_name, coordinates: [Number(place.lon), Number(place.lat)] });
    setOpen(false);
  };
  return <label className="field location-field">
    <span>{label}</span>
    <input required={required} value={value?.label || ''} placeholder={`Enter ${label.toLowerCase()}`} onFocus={() => setOpen(true)} onChange={(event) => { onChange({ label: event.target.value, coordinates: [] }); setOpen(true); }} />
    {open && results.length > 0 && <div className="location-results">
      {results.map((place) => <button type="button" key={place.place_id} onClick={() => choose(place)}>{place.display_name}</button>)}
    </div>}
  </label>;
}
