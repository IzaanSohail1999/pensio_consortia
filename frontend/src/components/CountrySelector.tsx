import React, { useState, useRef, useEffect } from 'react';
import { countries, Country, searchCountries, getCountriesByRegion } from '@/constants/countries';

interface CountrySelectorProps {
  onSelect: (country: Country) => void;
  excludedCountries?: string[]; // Countries to exclude from selection
  placeholder?: string;
  className?: string;
}

const CountrySelector: React.FC<CountrySelectorProps> = ({
  onSelect,
  excludedCountries = [],
  placeholder = "Search countries...",
  className = ""
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedRegion, setSelectedRegion] = useState<string>('all');
  const [filteredCountries, setFilteredCountries] = useState<Country[]>(countries);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Filter countries based on search query and region
  useEffect(() => {
    let filtered = countries;
    
    // Filter by region
    if (selectedRegion !== 'all') {
      filtered = getCountriesByRegion(selectedRegion);
    }
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = searchCountries(searchQuery);
      // Apply region filter to search results
      if (selectedRegion !== 'all') {
        filtered = filtered.filter(country => country.region === selectedRegion);
      }
    }
    
    // Exclude already selected countries
    filtered = filtered.filter(country => !excludedCountries.includes(country.code));
    
    setFilteredCountries(filtered);
  }, [searchQuery, selectedRegion, excludedCountries]);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleCountrySelect = (country: Country) => {
    onSelect(country);
    setIsOpen(false);
    setSearchQuery('');
  };

  const regions = ['all', 'Africa', 'Americas', 'Asia', 'Europe', 'Oceania'];

  return (
    <div className={`relative ${className}`} ref={dropdownRef}>
      {/* Trigger Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        className="w-full px-3 py-2 bg-[#2c344f] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 flex items-center justify-between"
      >
        <span className={searchQuery ? 'text-white' : 'text-gray-400'}>
          {searchQuery || placeholder}
        </span>
        <span className="text-gray-400">▼</span>
      </button>

      {/* Dropdown */}
      {isOpen && (
        <div className="absolute z-50 w-full mt-1 bg-[#1e2a46] border border-gray-600 rounded-md shadow-lg max-h-80 overflow-hidden">
          {/* Search and Region Filter */}
          <div className="p-3 border-b border-gray-600">
            {/* Search Input */}
            <input
              type="text"
              placeholder="Search countries..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full px-3 py-2 bg-[#2c344f] border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-3"
              autoFocus
            />
            
            {/* Region Filter */}
            <div className="flex flex-wrap gap-2">
              {regions.map((region) => (
                <button
                  key={region}
                  onClick={() => setSelectedRegion(region)}
                  className={`px-3 py-1 rounded-full text-xs font-medium transition-colors ${
                    selectedRegion === region
                      ? 'bg-blue-600 text-white'
                      : 'bg-[#2c344f] text-gray-300 hover:bg-[#3c445f]'
                  }`}
                >
                  {region === 'all' ? 'All Regions' : region}
                </button>
              ))}
            </div>
          </div>

          {/* Countries List */}
          <div className="max-h-60 overflow-y-auto">
            {filteredCountries.length === 0 ? (
              <div className="p-4 text-center text-gray-400">
                <p>No countries found</p>
                <p className="text-sm">Try adjusting your search or region filter</p>
              </div>
            ) : (
              filteredCountries.map((country) => (
                <button
                  key={country.code}
                  onClick={() => handleCountrySelect(country)}
                  className="w-full px-4 py-3 text-left hover:bg-[#2c344f] transition-colors flex items-center gap-3 border-b border-gray-700 last:border-b-0"
                >
                  <span className="text-lg">{country.flag}</span>
                  <div className="flex-1">
                    <div className="text-white font-medium">{country.name}</div>
                    <div className="text-gray-400 text-sm">
                      {country.code} • {country.region}
                    </div>
                  </div>
                </button>
              ))
            )}
          </div>
        </div>
      )}
    </div>
  );
};

export default CountrySelector;
