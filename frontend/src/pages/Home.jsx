import React, { useState, useEffect } from 'react';
import { getProperties } from '../services/api';
import PropertyCard from '../components/PropertyCard';
import FilterBar from '../components/FilterBar';

const Home = () => {
  const [properties, setProperties] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [filters, setFilters] = useState({});

  useEffect(() => {
    fetchProperties();
  }, []);

  const fetchProperties = async () => {
    try {
      setLoading(true);
      const data = await getProperties();
      setProperties(data.properties || []);
    } catch (err) {
      setError('Failed to load properties');
      console.error('Error fetching properties:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleFiltersChange = (newFilters) => {
    setFilters(newFilters);
    // TODO: Implement filtering logic
    console.log('Filters updated:', newFilters);
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading amazing places to stay...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="error-container">
        <h2>Oops! Something went wrong</h2>
        <p>{error}</p>
        <button onClick={fetchProperties} className="retry-button">
          Try Again
        </button>
      </div>
    );
  }

  return (
    <div className="home-page">
      {/* Hero Section */}
      <section className="hero-section">
        <div className="hero-content">
          <h1 className="hero-title">Find your next adventure</h1>
          <p className="hero-subtitle">
            Discover unique places to stay around the world
          </p>
        </div>
      </section>

      {/* Filters */}
      <section className="filters-section">
        <div className="container">
          <FilterBar onFiltersChange={handleFiltersChange} />
        </div>
      </section>

      {/* Properties Grid */}
      <section className="properties-section">
        <div className="container">
          <h2 className="section-title">
            {properties.length} stays available
          </h2>
          
          {properties.length > 0 ? (
            <div className="properties-grid">
              {properties.map((property) => (
                <PropertyCard key={property.id} property={property} />
              ))}
            </div>
          ) : (
            <div className="no-properties">
              <p>No properties found matching your criteria.</p>
              <button onClick={fetchProperties} className="refresh-button">
                Refresh
              </button>
            </div>
          )}
        </div>
      </section>
    </div>
  );
};

export default Home;