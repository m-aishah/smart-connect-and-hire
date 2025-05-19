'use client';

import Link from 'next/link';
import Image from 'next/image';
import { EyeIcon, Clock, Tag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { cn, formatDate, formatNumber } from '@/lib/utils';

import { Author } from '@/sanity/types';

export type ServiceCardType = {
  image: string;
  imageUrl: string;
  _id: string;
  _createdAt: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  pricing: string;
  views: number;
  provider?: Author;
};

const ServiceCard = ({ post }: { post: ServiceCardType }) => {
  return (
    <div className="startup-card group bg-white rounded-2xl shadow hover:shadow-md transition">
      {/* Header with Date & Views */}
      <div className="flex justify-between items-center px-4 pt-4 text-sm text-gray-500">
        <p className="flex items-center gap-1">
          <Clock className="w-4 h-4" />
          {formatDate(post._createdAt)}
        </p>
        <p className="flex items-center gap-1">
          <EyeIcon className="w-4 h-4" />
          {formatNumber(post.views)}
        </p>
      </div>

      {/* Provider + Title */}
      <div className="flex justify-between items-center px-4 mt-2">
        <div className="flex-1">
          {post.provider && (
            <Link href={`/user/${post.provider._id}`}>
              <p className="text-sm font-medium text-gray-800 line-clamp-1 hover:underline">
                {post.provider.name}
              </p>
            </Link>
          )}
          <Link href={`/service/${post._id}`}>
            <h3 className="text-lg font-semibold text-purple-700 line-clamp-1 hover:underline">
              {post.title}
            </h3>
          </Link>
        </div>
        {post.provider?.image && (
          <Image
            src={post.provider.image}
            alt="provider"
            width={40}
            height={40}
            className="rounded-full ml-2"
          />
        )}
      </div>

      {/* Image with Tag */}
      <Link href={`/service/${post._id}`} className="block relative mt-4">
        <Image
          src={post.imageUrl || post.image || post.image}
          alt={post.title}
          width={500}
          height={300}
          className="w-full h-48 object-cover rounded-t-xl"
        />
        <span className="absolute bottom-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow">
          <Tag className="w-3 h-3" /> {post.category}
        </span>
      </Link>

      {/* Short Description */}
      <p className="startup-card_desc px-4 mt-2 text-gray-600 text-sm line-clamp-2">
        {post.shortDescription}
      </p>

      {/* Bottom Actions */}
      <div className="flex justify-between items-center mt-4 px-4 pb-4">
        <Link
          href={`/?query=${post.category.toLowerCase()}`}
          className="text-purple-600 hover:text-purple-800 text-sm font-medium flex items-center gap-1"
        >
          Browse more <ArrowRight className="w-4 h-4" />
        </Link>
        <Button className="startup-card_btn" asChild>
          <Link href={`/service/${post._id}`}>Details <ArrowRight className="w-4 h-4" /></Link>
        </Button>
      </div>
    </div>
  );
};


interface ServiceCardSkeletonProps {
  count?: number;
}
export const ServiceCardSkeleton = ({count = 1}) => (
  <>
    {[0, 1, 2, 3, 4].map((_, index: number) => (
      <li key={cn('skeleton', index)}>
        <Skeleton className="startup-card_skeleton" />
      </li>
    ))}
  </>
);

export default ServiceCard;
