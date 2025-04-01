import React, { useState, useEffect, useCallback, useRef } from 'react';
import { PencilIcon, TrashIcon, PlusIcon, ChevronLeftIcon, ChevronRightIcon } from '@heroicons/react/24/outline';
import { itemsService } from './services/api/endpoints';

const LandingPage = () => {
  const [items, setItems] = useState([]);
  const [filteredItems, setFilteredItems] = useState([]);
  const [displayItems, setDisplayItems] = useState([]);
  const [groupBy, setGroupBy] = useState('none');
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [currentItem, setCurrentItem] = useState(null);
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    description: ''
  });
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage] = useState(10);
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [activeFilter, setActiveFilter] = useState(null);
  const [filterValue, setFilterValue] = useState([]);


  const fetchItems = useCallback(async () => {
    setIsLoading(true);
    setError(null);
    try {
      const response = await itemsService.getAll();
      setItems(response.data.data);
      setFilteredItems(response.data);
    } catch (err) {
      setError('Failed to load items. Please try again.');
      console.error('Error fetching items:', err);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchItems();
  }, [fetchItems]);

  useEffect(() => {
    // Apply filter to all items
    let result = items;

    if (activeFilter && filterValue) {
      if (filterValue === 'all') {
        // Show all items (reset filter)
        result = items;
      } else {
        // Apply specific filter
        result = items.filter(item =>
          String(item[activeFilter]).toLowerCase() === String(filterValue).toLowerCase()
        );
      }
    }

    setFilteredItems(result);
    setCurrentPage(1); // Reset to first page when filter changes
  }, [activeFilter, filterValue, items]);

  useEffect(() => {
    // Ensure filteredItems is always an array
    const safeFilteredItems = Array.isArray(filteredItems) ? filteredItems : [];

    const indexOfLastItem = currentPage * itemsPerPage;
    const indexOfFirstItem = indexOfLastItem - itemsPerPage;
    const paginatedItems = safeFilteredItems.slice(indexOfFirstItem, indexOfLastItem);

    if (groupBy === 'none') {
      setDisplayItems(paginatedItems);
    } else {
      const grouped = paginatedItems.reduce((acc, item) => {
        const key = item[groupBy] || 'Uncategorized';
        if (!acc[key]) {
          acc[key] = [];
        }
        acc[key].push(item);
        return acc;
      }, {});
      setDisplayItems(grouped);
    }
  }, [filteredItems, currentPage, itemsPerPage, groupBy]);

  const dropdownRef = useRef(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target)) {
        setFilterDropdownOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  // Get all unique categories for the filter dropdown
  const categories = [...new Set(items.map(item => item.category).filter(Boolean))];
  // Get all unique first letters of names for the filter dropdown
  const nameSections = [...new Set(items.map(item => item.name))].sort();

  const resetFilters = () => {
    setActiveFilter(null);
    setFilterValue([]);
    setFilteredItems(items);
  };

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleCreate = async (e) => {
    e.preventDefault();
    try {
      await itemsService.create(formData);
      setIsModalOpen(false);
      setFormData({ name: '', category: '', description: '' });
      fetchItems();
    } catch (err) {
      console.error('Error creating item:', err);
      setError('Failed to create item. Please try again.');
    }
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      const response = await itemsService.update(currentItem.id, formData);
      setItems(prev => prev.map(item => item.id === currentItem.id ? response.data : item));
      setFilteredItems(prev => prev.map(item => item.id === currentItem.id ? response.data : item));
      setIsModalOpen(false);
      setCurrentItem(null);
      setFormData({ name: '', category: '', description: '' });
    } catch (err) {
      console.error('Error updating item:', err);
      setError('Failed to update item. Please try again.');
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this item?')) return;
    try {
      await itemsService.delete(id);
      setItems(prev => prev.filter(item => item.id !== id));
      setFilteredItems(prev => prev.filter(item => item.id !== id));
    } catch (err) {
      console.error('Error deleting item:', err);
      setError('Failed to delete item. Please try again.');
    }
  };

  const handleEditClick = (item) => {
    setCurrentItem(item);
    setFormData({
      name: item.name,
      category: item.category,
      description: item.description
    });
    setIsModalOpen(true);
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const Table = ({ items, onEdit, onDelete }) => (
    <div className="overflow-x-auto">
      <table className="min-w-full divide-y divide-gray-200">
        <thead className="bg-gray-50 sticky top-0 z-10">
          <tr>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Description</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Category</th>
            <th className="px-3 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
          </tr>
        </thead>
        <tbody className="bg-white divide-y divide-gray-200">
          {Array.isArray(items) && items.map(item => (
            <tr key={item.id}>
              <td className="px-3 py-4 whitespace-normal">
                <div className="text-sm font-medium text-gray-900">{item.name}</div>
              </td>
              <td className="px-3 py-4 whitespace-normal">
                <div className="text-sm text-gray-900">{item.description}</div>
              </td>
              <td className="px-3 py-4 whitespace-nowrap">
                <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                  {item.category}
                </span>
              </td>
              <td className="px-3 py-4 whitespace-nowrap text-right text-sm font-medium">
                <button
                  onClick={() => handleEditClick(item)}
                  className="text-blue-600 hover:text-blue-900 mr-4"
                >
                  <PencilIcon className="h-5 w-5 inline" />
                </button>
                <button
                  onClick={() => handleDelete(item.id)}
                  className="text-red-600 hover:text-red-900"
                >
                  <TrashIcon className="h-5 w-5 inline" />
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );

  const Pagination = () => {
    // Safely calculate totalPages with fallbacks
    const safeItemsLength = Array.isArray(filteredItems) ? filteredItems.length : 0;
    const safeItemsPerPage = Number(itemsPerPage) || 10; // Fallback to 10 if invalid
    const totalPages = Math.max(Math.ceil(safeItemsLength / safeItemsPerPage), 1);

    // Don't show pagination if only 1 page
    if (totalPages <= 1) return null;

    // Calculate visible page range
    const maxVisiblePages = 5;
    const currentSafePage = Math.min(Math.max(1, Number(currentPage) || 1), totalPages);

    let startPage = Math.max(1, currentSafePage - Math.floor(maxVisiblePages / 2));
    let endPage = Math.min(totalPages, startPage + maxVisiblePages - 1);

    // Adjust if we don't have enough pages to show
    if (endPage - startPage + 1 < maxVisiblePages) {
      startPage = Math.max(1, endPage - maxVisiblePages + 1);
    }

    // Generate page numbers
    const pageNumbers = [];
    for (let i = startPage; i <= endPage; i++) {
      pageNumbers.push(i);
    }

    return (
      <div className="flex items-center justify-between mt-4">
        <div className="text-sm text-gray-700">
          Showing <span className="font-medium">
            {Math.min((currentSafePage - 1) * safeItemsPerPage + 1, safeItemsLength)}
          </span> to{' '}
          <span className="font-medium">
            {Math.min(currentSafePage * safeItemsPerPage, safeItemsLength)}
          </span>{' '}
          of <span className="font-medium">{safeItemsLength}</span> results
        </div>

        <div className="flex space-x-2">
          {/* Previous Page Button */}
          <button
            onClick={() => paginate(Math.max(1, currentSafePage - 1))}
            disabled={currentSafePage === 1}
            className={`px-3 py-1 rounded-md ${currentSafePage === 1
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            <ChevronLeftIcon className="h-4 w-4" />
          </button>

          {/* First Page + Ellipsis */}
          {startPage > 1 && (
            <>
              <button
                onClick={() => paginate(1)}
                className={`px-3 py-1 rounded-md ${1 === currentSafePage
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                1
              </button>
              {startPage > 2 && <span className="px-2 py-1">...</span>}
            </>
          )}

          {/* Page Numbers */}
          {pageNumbers.map(number => (
            <button
              key={number}
              onClick={() => paginate(number)}
              className={`px-3 py-1 rounded-md ${number === currentSafePage
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                }`}
            >
              {number}
            </button>
          ))}

          {/* Last Page + Ellipsis */}
          {endPage < totalPages && (
            <>
              {endPage < totalPages - 1 && <span className="px-2 py-1">...</span>}
              <button
                onClick={() => paginate(totalPages)}
                className={`px-3 py-1 rounded-md ${totalPages === currentSafePage
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                  }`}
              >
                {totalPages}
              </button>
            </>
          )}

          {/* Next Page Button */}
          <button
            onClick={() => paginate(Math.min(totalPages, currentSafePage + 1))}
            disabled={currentSafePage === totalPages}
            className={`px-3 py-1 rounded-md ${currentSafePage === totalPages
                ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
          >
            <ChevronRightIcon className="h-4 w-4" />
          </button>
        </div>
      </div>
    );
  };

  const renderItems = () => {
    return (
      <>
        <div className="max-h-[calc(100vh-278px)] overflow-y-auto rounded-lg border border-gray-200 shadow-sm mb-4">
          {groupBy === 'none' ? (
            <Table items={Array.isArray(displayItems) ? displayItems : []} />
          ) : (

            Object.keys(displayItems).map(key => (
              <div key={key}>
                <h3 className='font-bold text-gray-700'>{key}</h3>
                <Table items={Array.isArray(displayItems[key]) ? displayItems[key] : []} />
              </div>
            ))
          )}
        </div>
        <Pagination />
      </>
    );
  };

  if (isLoading) {
    return <div className="flex justify-center items-center h-64">Loading...</div>;
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-64 p-4">
        <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
        <button
          onClick={fetchItems}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Retry
        </button>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-2 sm:px-4 py-4 sm:py-8">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-4 gap-2">
        <h1 className="text-xl sm:text-2xl font-bold text-gray-800">Inventory Management</h1>
        <button
          onClick={() => {
            setCurrentItem('');
            setFormData({ name: '', category: '', description: '' });
            setIsModalOpen(true);
          }}
          className="flex items-center px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 w-full sm:w-auto justify-center"
        >
          <PlusIcon className="h-4 w-4 sm:h-5 sm:w-5 mr-1 sm:mr-2" />
          <span>Add New Item</span>
        </button>
      </div>

      <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-2 mb-4">

        {/* Filter dropdown */}
        <div className="relative" ref={dropdownRef}>
          <button
            onClick={() => setFilterDropdownOpen(!filterDropdownOpen)}
            className="flex items-center justify-between px-3 py-2 border border-gray-300 rounded-md bg-white text-sm sm:text-base w-full sm:w-auto"
          >
            <span>{activeFilter ? `${activeFilter}: ${filterValue.join(", ")}` : "Filter by..."}</span>
            <svg className="ml-2 h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
            </svg>
          </button>

          {filterDropdownOpen && (
            <div className="absolute top-full left-0 mt-1 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 z-50">
              <div className="py-1 max-h-60 overflow-y-auto">
                <div className="px-4 py-2 text-sm font-medium text-gray-700 border-b">Filter by</div>

                {/* Category section */}
                <div className="px-4 py-2">
                  <button
                    onClick={() => setActiveFilter(activeFilter === "category" ? null : "category")}
                    className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    Category
                  </button>
                  {activeFilter === "category" && (
                    <div className="mt-1 pl-4">
                      {categories.map((category) => (
                        <label key={category} className="flex items-center text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={filterValue.includes(category)}
                            onChange={(e) => {
                              setFilterValue((prev) =>
                                e.target.checked ? [...prev, category] : prev.filter((c) => c !== category)
                              );
                            }}
                          />
                          {category}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Name section */}
                <div className="px-4 py-2">
                  <button
                    onClick={() => setActiveFilter(activeFilter === "name" ? null : "name")}
                    className="w-full text-left text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded"
                  >
                    Name
                  </button>
                  {activeFilter === "name" && (
                    <div className="mt-1 pl-4">
                      {nameSections.map((letter) => (
                        <label key={letter} className="flex items-center text-sm text-gray-700 hover:bg-gray-100 px-2 py-1 rounded">
                          <input
                            type="checkbox"
                            className="mr-2"
                            checked={filterValue.includes(letter)}
                            onChange={(e) => {
                              setFilterValue((prev) =>
                                e.target.checked ? [...prev, letter] : prev.filter((l) => l !== letter)
                              );
                            }}
                          />
                          {letter}
                        </label>
                      ))}
                    </div>
                  )}
                </div>

                {/* Reset filter */}
                {filterValue.length > 0 && (
                  <div className="px-4 py-2 border-t">
                    <button
                      onClick={() => {
                        resetFilters();
                        setFilterDropdownOpen(false);
                      }}
                      className="w-full text-left text-sm text-red-600 hover:bg-gray-100 px-2 py-1 rounded"
                    >
                      Clear Filter
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Group by dropdown */}
        <select
          value={groupBy}
          onChange={(e) => setGroupBy(e.target.value)}
          className="border bg-white border-gray-300 rounded-md px-2 sm:px-3 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm sm:text-base"
        >
          <option value="none">No Grouping</option>
          <option value="category">Group by Category</option>
          <option value="name">Group by Name</option>
        </select>
      </div>

      {items.length > 0 ? (renderItems()) : (<div className="flex justify-center items-center h-64">No items added yet...</div>)}

      {/* Add/Edit Item Modal */}
      {isModalOpen && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-2 sm:p-4">
          <div className="bg-white rounded-lg shadow-xl p-4 sm:p-6 w-full max-w-md">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-lg sm:text-xl font-semibold">
                {currentItem ? 'Edit Item' : 'Add New Item'}
              </h2>
              <button
                onClick={() => {
                  setIsModalOpen(false);
                  setCurrentItem(null);
                  setFormData({ name: '', category: '', description: '' });
                }}
                className="text-gray-500 hover:text-gray-700 text-xl"
              >
                &times;
              </button>
            </div>
            <form onSubmit={currentItem ? handleUpdate : handleCreate}>
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
                  Name *
                </label>
                <input
                  type="text"
                  name="name"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  value={formData.name}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-3 sm:mb-4">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
                  Category *
                </label>
                <input
                  type="text"
                  name="category"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  value={formData.category}
                  onChange={handleInputChange}
                  required
                />
              </div>
              <div className="mb-4 sm:mb-6">
                <label className="block text-sm sm:text-base font-medium text-gray-700 mb-1">
                  Description
                </label>
                <textarea
                  name="description"
                  className="w-full px-3 py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                />
              </div>
              <div className="flex justify-end gap-2 sm:gap-3">
                <button
                  type="button"
                  onClick={() => {
                    setIsModalOpen(false);
                    setCurrentItem(null);
                    setFormData({ name: '', category: '', description: '' });
                  }}
                  className="px-3 py-1 sm:px-4 sm:py-2 border border-gray-300 rounded-md text-sm sm:text-base"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-3 py-1 sm:px-4 sm:py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 text-sm sm:text-base"
                >
                  {currentItem ? 'Update' : 'Save'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
};

export default LandingPage;