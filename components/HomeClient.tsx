'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import ServiceCard, { ServiceCardType } from '@/components/ServiceCard';
import SearchForm from '@/components/SearchForm';
import CategoryFilter from '@/components/CategoryFilter';

interface Props {
  query: string;
  services: ServiceCardType[];
}

export default function HomeClient({ query, services }: Props) {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState(query || '');
  const [selectedCategory, setSelectedCategory] = useState('all');

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const params = new URLSearchParams();
    if (searchQuery) {
      params.set('query', searchQuery);
    }
    router.push(`/?${params.toString()}`);
  };

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
  };

  const filteredServices =
    selectedCategory === 'all'
      ? services
      : services.filter((s) => s.category === selectedCategory);

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
                ? `Search results for "${query}"`
                : 'Explore All Services'}
            </p>
          </div>

          {/* Category Filter Component */}
          <CategoryFilter
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {filteredServices.length === 0 ? (
            <div className="text-center text-gray-500 py-12 text-lg">No results found</div>
          ) : (
            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-2 xl:grid-cols-3 gap-6">
              {filteredServices.map((service, index) => (
                <motion.li
                  key={service._id || index}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 }}
                  className="rounded-3xl overflow-hidden border border-purple-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <ServiceCard post={service} />
                </motion.li>
              ))}
            </ul>
          )}
        </motion.div>
      </section>
    </>
  );
}