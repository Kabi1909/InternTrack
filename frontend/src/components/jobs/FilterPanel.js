import { categories } from "../../data/mockData";
import { Input, Select } from "../common/UI";
export default function FilterPanel({ filters, onChange, onClear }) {
  const toggle = (key, value) =>
    onChange({
      ...filters,
      [key]: filters[key].includes(value)
        ? filters[key].filter((v) => v !== value)
        : [...filters[key], value],
    });
  return (
    <aside className="filter-panel">
      <div className="filter-top">
        <h3>Filter opportunities</h3>
        <button onClick={onClear}>Reset all</button>
      </div>
      {[
        ["type", "Job type", ["Internship", "Full-time", "Part-time"]],
        ["mode", "Work arrangement", ["Remote", "Hybrid", "Onsite"]],
      ].map(([key, title, options]) => (
        <fieldset className="filter-group" key={key}>
          <legend>{title}</legend>
          {options.map((option) => (
            <label key={option}>
              <input
                type="checkbox"
                checked={filters[key].includes(option)}
                onChange={() => toggle(key, option)}
              />
              {option}
            </label>
          ))}
        </fieldset>
      ))}
      <div className="form-stack">
        <Select
          label="Experience level"
          value={filters.experience}
          onChange={(e) => onChange({ ...filters, experience: e.target.value })}
        >
          <option value="">All experience levels</option>
          <option>No experience</option>
          <option>Entry level</option>
          <option>1–2 years</option>
        </Select>
        <Select
          label="Category"
          value={filters.category}
          onChange={(e) => onChange({ ...filters, category: e.target.value })}
        >
          <option value="">All categories</option>
          {categories.map((c) => (
            <option key={c}>{c}</option>
          ))}
        </Select>
        <Input
          label="Skills"
          placeholder="e.g. React"
          value={filters.skills}
          onChange={(e) => onChange({ ...filters, skills: e.target.value })}
        />
      </div>
    </aside>
  );
}
