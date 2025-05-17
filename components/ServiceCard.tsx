import Link from "next/link";
import Image from "next/image";
import { EyeIcon, Clock, Tag, ArrowRight } from "lucide-react";

import { Author } from "@/sanity/types";
import { cn, formatDate, formatNumber } from "@/lib/utils";

import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";

export type ServiceCardType = {
  image: string;
  _id: string;
  _createdAt: string;
  title: string;
  shortDescription: string;
  description: string;
  category: string;
  pricing: string;
  imageUrl: string;
  views: number;
  provider?: Author;
};

const ServiceCard = ({ post }: { post: ServiceCardType }) => {
  return (
    <div className="startup-card group">
      <div className="flex justify-between ">
        <p className="startup-card_date">
          <Clock className="w-4 h-4" /> {formatDate(post._createdAt)}
        </p>
        <div className="flex items-center gap-1 text-gray-500 text-sm">
          <EyeIcon className="w-4 h-4" /><span>{formatNumber(post.views)}</span>
        </div>
      </div>

      <div className="flex justify-between items-center mt-4">
        <div className="flex-1">
          <Link href={`/user/${post.provider?._id}`}>
            <p className="text-sm font-medium text-gray-800 line-clamp-1">
              {post.provider?.name}
            </p>
          </Link>
          <Link href={`/service/${post._id}`}>
            <h3 className="text-lg font-semibold text-purple-700 line-clamp-1">
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
            className="rounded-full"
          />
        )}
      </div>

      <Link href={`/service/${post._id}`} className="block mt-4 relative">
        <img
          src={post.imageUrl || post.image}
          alt={post.title}
          className="startup-card_img"
        />
        <span className="absolute bottom-2 left-2 bg-yellow-100 text-yellow-800 text-xs font-semibold px-2 py-1 rounded-full flex items-center gap-1 shadow">
          <Tag className="w-3 h-3" /> {post.category}
        </span>
      </Link>

      <p className="startup-card_desc">{post.shortDescription}</p>

      <div className="flex justify-between items-center mt-4">
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