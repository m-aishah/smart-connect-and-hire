'use client';

import Image from 'next/image';
import Link from 'next/link';
import { Eye } from 'lucide-react';
import { ServiceType } from './HomeClient';
import { Skeleton } from './ui/skeleton';
import { cn } from '@/lib/utils';

interface ServiceCardProps {
  service: ServiceType;
}

const ServiceCard = ({ service }: ServiceCardProps) => {
  return (
    <div className="bg-white h-full flex flex-col overflow-hidden">
      {/* Service Image */}
      <div className="relative h-48 w-full overflow-hidden">
        {service.image ? (
          <Image
            src={service.image}
            alt={service.title}
            className="object-cover"
            fill
            sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
          />
        ) : (
          <div className="absolute inset-0 bg-purple-200 flex items-center justify-center">
            <span className="text-purple-700">No image available</span>
          </div>
        )}
        <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/70 to-transparent p-4">
          <div className="flex items-center">
            <span className="px-2 py-1 text-xs font-medium bg-purple-600 text-white rounded-full">
              {service.category}
            </span>
            {service.views !== undefined && (
              <div className="ml-2 flex items-center text-white text-xs">
                <Eye className="h-3 w-3 mr-1" />
                <span>{service.views}</span>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Content */}
      <div className="p-5 flex-grow flex flex-col">
        <Link href={`/service/${service._id}`}>
          <h3 className="text-xl font-semibold text-gray-800 mb-2 hover:text-purple-600 transition-colors">
            {service.title}
          </h3>
        
          <p className="text-gray-600 text-sm mb-4 flex-grow">
            {service.shortDescription}
          </p>
        </Link>

        {/* Service Provider Details */}
        <div className="mt-auto">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              {service.provider?.image && (
                <div className="relative h-8 w-8 rounded-full overflow-hidden">
                  <Image
                    src={service.provider.image}
                    alt={service.provider.name || 'Provider'}
                    className="object-cover"
                    fill
                    sizes="32px"
                  />
                </div>
              )}
              <span className="ml-2 text-sm font-medium text-gray-700">
                {service.provider?.name || 'Anonymous'}
              </span>
            </div>
            <span className="text-sm font-bold text-purple-700">
              {service.pricing}
            </span>
          </div>
        </div>
      </div>
    </div>
  );
};

export const ServiceCardSkeleton = () => (
  <>
    {[0, 1, 2, 3, 4].map((_, index: number) => (
      <li key={cn("skeleton", index)}>
        <Skeleton className="startup-card_skeleton" />
      </li>
    ))}
  </>
);

export default ServiceCard;