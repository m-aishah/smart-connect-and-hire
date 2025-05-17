import Form from "next/form";
import { Search } from "lucide-react";

import { Button } from "@/components/ui/button";
import SearchFormReset from "@/components/SearchFormReset";

const SearchForm = ({ query }: { query?: string }) => {
  return (
    <Form action="/" scroll={false} className="search-form" role="search" aria-label="Search for a service">
      <input
        name="query"
        defaultValue={query}
        className="search-input text-gray-500"
        placeholder="Search Service"
        aria-label="Search Service"
        autoComplete="off"
      />

      <div className="flex gap-2">
        {query && <SearchFormReset />}

        <Button type="submit" className="search-btn" aria-label="Submit search">
          {/* Use size and color props for lucide icon */}
          <Search size={24} color="white" />
        </Button>
      </div>
    </Form>
  );
};

export default SearchForm;
