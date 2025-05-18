'use client';

import { X } from "lucide-react";

const SearchFormReset = () => {
  const reset = () => {
    // Find parent form element and reset it
    const form = document.querySelector(".search-form") as HTMLFormElement;
    if (form) {
      form.reset();
      // Also redirect to home to clear query params
      window.location.href = '/';
    }
  };
  
  return (
    <button
      type="button"
      onClick={reset}
      className="text-gray-400 hover:text-gray-600 focus:outline-none"
      aria-label="Clear search"
    >
      <X size={18} />
    </button>
  );
};

export default SearchFormReset;