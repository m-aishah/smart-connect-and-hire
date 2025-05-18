'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ServiceCard from '@/components/ServiceCard';
import SearchForm from '@/components/SearchForm';
import CategoryFilter from '@/components/CategoryFilter';

// Define types according to your schema
export interface ServiceType {
  _id: string;
  _createdAt: string;
  title: string;
  shortDescription: string;
  category: string;
  pricing: string;
  image: string;
  provider: {
    _id: string;
    name: string;
    image: string;
  };
  views?: number;
}

interface PaginationType {
  total: number;
  page: number;
  limit: number;
  pages: number;
}

interface Props {
  query: string;
  services: ServiceType[];
  pagination?: PaginationType;
  searchParams?: {
    category?: string;
  };
}

export default function HomeClient({ 
  query, 
  services, 
  pagination = { total: services?.length || 0, page: 1, limit: 12, pages: 1 },
  searchParams = {}
}: Props) {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || 'all');

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    
    // Update URL with selected category
    const params = new URLSearchParams();
    if (query) params.set('query', query);
    if (category !== 'all') params.set('category', category);
    
    router.push(`/?${params.toString()}`);
  };

  // Handle page change for pagination
  const handlePageChange = (page: number) => {
    const params = new URLSearchParams();
    
    if (query) params.set('query', query);
    if (selectedCategory !== 'all') params.set('category', selectedCategory);
    params.set('page', String(page));
    
    router.push(`/?${params.toString()}`);
  };

  return (
    <>
      {/* Hero Section */}
      <section className="bg-purple-50 py-16 px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="rounded-3xl bg-purple-100/70 shadow-xl border border-purple-200 px-8 py-12 max-w-6xl mx-auto text-center"
        >
          <h1 className="text-4xl sm:text-5xl font-bold text-purple-900 leading-tight">
            Smart <br />
            Connect & Hire
          </h1>
          <p className="text-lg mt-4 text-purple-700 max-w-2xl mx-auto font-medium">
            Connect Smarter, Hire Faster
          </p>

          <div className="mt-8 max-w-xl mx-auto">
            <SearchForm query={query} />
          </div>
        </motion.div>
      </section>

      {/* Filter & Services */}
      <section className="bg-purple-50 py-16 px-4 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="rounded-3xl bg-purple-100/70 shadow-xl border border-purple-200 px-6 py-10 max-w-6xl mx-auto"
        >
          <div className="mb-6">
            <p className="text-xl font-semibold text-purple-900 text-center flex items-center justify-center">
              {query
                ? `Search results for "${query}" (${pagination.total} found)`
                : 'Explore All Services'}
            </p>
          </div>

          {/* Category Filter Component */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {services.length === 0 ? (
            <div className="text-center text-gray-500 py-12 text-lg">
              No results found. Try a different search or category.
            </div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {services.map((service, index) => (
                <motion.li
                  key={service._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-3xl overflow-hidden border border-purple-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <ServiceCard service={service} />
                </motion.li>
              ))}
            </ul>
          )}
          
          {/* Simple Pagination */}
          {pagination.pages > 1 && (
            <div className="mt-8 flex justify-center">
              <div className="flex items-center gap-2">
                {pagination.page > 1 && (
                  <button
                    onClick={() => handlePageChange(pagination.page - 1)}
                    className="px-4 py-2 rounded-md bg-purple-200 text-purple-900 hover:bg-purple-300 transition-colors"
                  >
                    Previous
                  </button>
                )}
                
                <span className="px-4 py-2 text-purple-900">
                  Page {pagination.page} of {pagination.pages}
                </span>
                
                {pagination.page < pagination.pages && (
                  <button
                    onClick={() => handlePageChange(pagination.page + 1)}
                    className="px-4 py-2 rounded-md bg-purple-200 text-purple-900 hover:bg-purple-300 transition-colors"
                  >
                    Next
                  </button>
                )}
              </div>
            </div>
          )}
        </motion.div>
      </section>
    </>
  );
}