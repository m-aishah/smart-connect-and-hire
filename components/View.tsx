'use client'

import { useEffect, useState } from 'react';
import Ping from "@/components/Ping";
import { formatNumber } from "@/lib/utils";
import { incrementViewCount } from "@/actions/view-actions";
import { client } from "@/sanity/lib/client";
import { SERVICE_VIEWS_QUERY } from "@/sanity/lib/queries";

const View = ({ id }: { id: string }) => {
  const [views, setViews] = useState<number | null>(null);

  useEffect(() => {
    async function fetchViews() {
      try {
        const result = await client
          .withConfig({ useCdn: false })
          .fetch(SERVICE_VIEWS_QUERY, { id });

        const totalViews = result?.views || 0;
        setViews(totalViews + 1);

        incrementViewCount(id).catch(console.error);
      } catch (error) {
        console.error('Error fetching views:', error);
      }
    }

    fetchViews();
  }, [id]);

  if (views === null) return null;

  return (
    <div className="view-container">
      <div className="absolute -top-2 -right-2">
        <Ping />
      </div>
      <p className="view-text">
        <span className="font-black">{formatNumber(views)}</span> views
      </p>
    </div>
  );
};

export default View;
