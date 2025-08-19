import { useState, useEffect, useRef } from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { faChevronDown, faSearch } from '@fortawesome/free-solid-svg-icons';
import FilterIMG from '../src/assets/whitebg.png';
import './FilterExclusive.scss';

// Custom hook to determine if the screen is mobile-sized
const useIsMobile = () => {
  const [isMobile, setIsMobile] = useState(window.innerWidth < 991);

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 991);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  return isMobile;
};

const FilterExclusive = ({
  productCount,
  selectedCategory,
  minPrice,
  maxPrice,
  stockFilter,
  sortOrder,
  selectedRatings,
  handleCategoryChange,
  handleMinPriceChange,
  handleMaxPriceChange,
  handleSortChange,
  handleRatingChange,
  handleStockFilterChange,
  inStockCount,
  outOfStockCount,
  clearCategory,
  clearPrice,
  clearRating,
  clearAvailability,
  handleSearchChange,
  handleSearchSubmit,
  searchQuery,
}) => {
  const [openDropdown, setOpenDropdown] = useState(null);
  const [searchActive, setSearchActive] = useState(false);
  const [sortBy, setSortBy] = useState(sortOrder);
  const [showFilters, setShowFilters] = useState(false);

  const isMobile = useIsMobile();

  const categoryRef = useRef(null);
  const availabilityRef = useRef(null);
  const priceRef = useRef(null);
  const sortByRef = useRef(null);

  const toggleDropdown = (dropdownName) => {
    setOpenDropdown((prev) => (prev === dropdownName ? null : dropdownName));
  };

  const handleClickOutside = (event) => {
    if (
      (categoryRef.current && !categoryRef.current.contains(event.target)) &&
      (availabilityRef.current && !availabilityRef.current.contains(event.target)) &&
      (priceRef.current && !priceRef.current.contains(event.target)) &&
      (sortByRef.current && !sortByRef.current.contains(event.target)) &&
      !event.target.closest('.filter-container-left')
    ) {
      setOpenDropdown(null);
      setShowFilters(false); // Close the side menu in mobile view
    }
  };

  useEffect(() => {
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="exclusive-filter-section-container">
      <div className={`exclusive-filter-left ${isMobile && showFilters ? 'exclusive-show-filters' : ''}`}>
        <div className="exclusive-fff" onClick={() => setShowFilters(!showFilters)}>
          <img src={FilterIMG} alt="filter img" />
          <label style={{ fontWeight: 'bold' }}>Filters: </label>
        </div>
        {(isMobile && showFilters) && (
          <>
            <div className="exclusive-filter" ref={categoryRef}>
              <label>Category</label>
              <div className="exclusive-dropdown">
                <div className="exclusive-header">
                  <label className="exclusive-category-label">Category</label>
                  <label className="exclusive-reset-label" onClick={clearCategory}>
                    Clear
                  </label>
                </div>

                <div className="exclusive-horizontal-options">
                  <div className="exclusive-fd">
                    <input
                      type="checkbox"
                      name="Bags"
                      value="Bags"
                      checked={selectedCategory.includes('Bags')}
                      onChange={handleCategoryChange}
                    />
                    <label>Bags</label>
                  </div>
                  <div className="exclusive-fd">
                    <input
                      type="checkbox"
                      value="Shoes"
                      checked={selectedCategory.includes('Shoes')}
                      onChange={handleCategoryChange}
                    />
                    <label>Shoes</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="exclusive-filter" ref={availabilityRef}>
              <label>Availability</label>
              <div className="exclusive-dropdown">
                <div className="exclusive-header">
                  <label className="exclusive-availability-label">Availability</label>
                  <label className="exclusive-reset-label" onClick={clearAvailability}>
                    Clear
                  </label>
                </div>
                <div className="exclusive-horizontal-options">
                  <div className="exclusive-fd">
                    <input
                      type="checkbox"
                      value="inStock"
                      checked={stockFilter === 'inStock'}
                      onChange={handleStockFilterChange}
                    />
                    <label>In Stock ({inStockCount})</label>
                  </div>
                  <div className="exclusive-fd">
                    <input
                      type="checkbox"
                      value="outOfStock"
                      checked={stockFilter === 'outOfStock'}
                      onChange={handleStockFilterChange}
                    />
                    <label>Out of Stock ({outOfStockCount})</label>
                  </div>
                </div>
              </div>
            </div>

            <div className="exclusive-filter" ref={priceRef}>
              <label>Price</label>
              <div className="exclusive-dropdown">
                <div className="exclusive-header">
                  <label className="exclusive-price-range-label">Price Range</label>
                  <label className="exclusive-reset-label" onClick={clearPrice}>
                    Clear
                  </label>
                </div>
                <div className="exclusive-horizontal-options">
                  <input
                    type="text"
                    name="from"
                    value={minPrice}
                    onChange={handleMinPriceChange}
                    placeholder="From"
                  />
                  <input
                    type="text"
                    name="to"
                    value={maxPrice}
                    onChange={handleMaxPriceChange}
                    placeholder="To"
                  />
                </div>
              </div>
            </div>

            <div className="exclusive-filter" ref={sortByRef}>
              <label>Sort By</label>
              <div className="exclusive-dropdown">
                <div className="exclusive-header">
                  <label className="exclusive-sort-by-label">Sort By</label>
                  <label className="exclusive-reset-label" onClick={() => { clearPrice(); setSortBy('featured'); }}>
                    Clear
                  </label>
                </div>
                <div className="exclusive-horizontal-options">
                  <select
                    value={sortOrder}
                    onChange={(e) => {
                      setSortBy(e.target.value);
                      handleSortChange(e);
                    }}
                  >
                    <option value="featured">Featured</option>
                    <option value="a-z">Alphabetically, A-Z</option>
                    <option value="z-a">Alphabetically, Z-A</option>
                    <option value="high-low">Price, High to Low</option>
                    <option value="low-high">Price, Low to High</option>
                  </select>
                </div>
              </div>
            </div>
          </>
        )}
        {!isMobile && (
          <>
            <div className="exclusive-filter" ref={categoryRef}>
              <label onClick={() => toggleDropdown('category')}>
                Category{' '}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  style={{ fontSize: '13px', marginLeft: '10px' }}
                />
              </label>
              {openDropdown === 'category' && (
                <div className="exclusive-dropdown">
                  <div className="exclusive-header">
                    <label className="exclusive-category-label">Category</label>
                    <label className="exclusive-reset-label" onClick={clearCategory}>
                      Clear
                    </label>
                  </div>
                  <div className="exclusive-horizontal-options">
                    <div className="exclusive-fd">
                      <input
                        type="checkbox"
                        name="Bags"
                        value="Bags"
                        checked={selectedCategory.includes('Bags')}
                        onChange={handleCategoryChange}
                      />
                      <label>Bags</label>
                    </div>
                    <div className="exclusive-fd">
                      <input
                        type="checkbox"
                        value="Shoes"
                        checked={selectedCategory.includes('Shoes')}
                        onChange={handleCategoryChange}
                      />
                      <label>Shoes</label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="exclusive-filter" ref={availabilityRef}>
              <label onClick={() => toggleDropdown('availability')}>
                Availability{' '}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  style={{ fontSize: '13px', marginLeft: '10px' }}
                />
              </label>
              {openDropdown === 'availability' && (
                <div className="exclusive-dropdown">
                  <div className="exclusive-header">
                    <label className="exclusive-availability-label">Availability</label>
                    <label className="exclusive-reset-label" onClick={clearAvailability}>
                      Clear
                    </label>
                  </div>
                  <div className="exclusive-horizontal-options">
                    <div className="exclusive-fd">
                      <input
                        type="checkbox"
                        value="inStock"
                        checked={stockFilter === 'inStock'}
                        onChange={handleStockFilterChange}
                      />
                      <label>In Stock ({inStockCount})</label>
                    </div>
                    <div className="exclusive-fd">
                      <input
                        type="checkbox"
                        value="outOfStock"
                        checked={stockFilter === 'outOfStock'}
                        onChange={handleStockFilterChange}
                      />
                      <label>Out of Stock ({outOfStockCount})</label>
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="exclusive-filter" ref={priceRef}>
              <label onClick={() => toggleDropdown('price')}>
                Price{' '}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  style={{ fontSize: '13px', marginLeft: '10px' }}
                />
              </label>
              {openDropdown === 'price' && (
                <div className="exclusive-dropdown">
                  <div className="exclusive-header">
                    <label className="exclusive-price-range-label">Price Range</label>
                    <label className="exclusive-reset-label" onClick={clearPrice}>
                      Clear
                    </label>
                  </div>
                  <div className="exclusive-horizontal-options">
                    <input
                      type="text"
                      name="from"
                      value={minPrice}
                      onChange={handleMinPriceChange}
                      placeholder="From"
                    />
                    <input
                      type="text"
                      name="to"
                      value={maxPrice}
                      onChange={handleMaxPriceChange}
                      placeholder="To"
                    />
                  </div>
                </div>
              )}
            </div>

            <div className="exclusive-filter" ref={sortByRef}>
              <label onClick={() => toggleDropdown('sortBy')}>
                Sort By{' '}
                <FontAwesomeIcon
                  icon={faChevronDown}
                  style={{ fontSize: '13px', marginLeft: '10px' }}
                />
              </label>
              {openDropdown === 'sortBy' && (
                <div className="exclusive-dropdown">
                  <div className="exclusive-header">
                    <label className="exclusive-sort-by-label">Sort By</label>
                    <label className="exclusive-reset-label" onClick={() => { clearPrice(); setSortBy('featured'); }}>
                      Clear
                    </label>
                  </div>
                  <div className="exclusive-horizontal-options">
                    <select
                      value={sortOrder}
                      onChange={(e) => {
                        setSortBy(e.target.value);
                        handleSortChange(e);
                      }}
                    >
                      <option value="featured">Featured</option>
                      <option value="a-z">Alphabetically, A-Z</option>
                      <option value="z-a">Alphabetically, Z-A</option>
                      <option value="high-low">Price, High to Low</option>
                      <option value="low-high">Price, Low to High</option>
                    </select>
                  </div>
                </div>
              )}
            </div>
          </>
        )}
      </div>

      <div className="exclusive-filter-right">
        <div className={`exclusive-search-bar ${searchActive ? 'exclusive-active' : ''}`}>
          <div className="exclusive-search-icon" onClick={() => setSearchActive(!searchActive)}>
            <FontAwesomeIcon icon={faSearch} className="exclusive-fa-search" />
          </div>
          <input
            type="text"
            className="exclusive-search-input"
            value={searchQuery}
            onChange={handleSearchChange}
            placeholder="Search products..."
          />
        </div>
      </div>
    </div>
  );
};

export default FilterExclusive;
