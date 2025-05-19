'use client';

import Link from "next/link";
import Image from "next/image";
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { User, Calendar, Tag, DollarSign, ChevronRight } from "lucide-react";
import markdownit from "markdown-it";
import { ServiceCardType } from "@/components/ServiceCard";
import { formatDate } from "@/lib/utils";
import View from "@/components/View";
import ServiceCard from "@/components/ServiceCard";

const md = markdownit();

export interface ServiceProviderType {
  _id?: string;
  name?: string;
  username?: string;
  image?: string;
}

export interface RelatedServiceType extends ServiceCardType {}

interface ServiceType {
  _id: string;
  title: string;
  shortDescription?: string;
  description?: string;
  image?: string;
  category?: string;
  pricing?: string;
  _createdAt?: string;
  provider?: ServiceProviderType;
}

interface ServiceClientProps {
  service: ServiceType;
  relatedServices: RelatedServiceType[];
  id: string;
}

export default function ServiceClient({ service, relatedServices, id }: ServiceClientProps) {

  const [parsedContent, setParsedContent] = useState<string>("");
  
  useEffect(() => {
    if (service?.description) {
      setParsedContent(md.render(service.description));
    }
  }, [service?.description]);

  const categoryLabels: {[key: string]: string} = {
    design: "Design & Creative",
    development: "Development & IT",
    marketing: "Marketing",
    business: "Business",
    lifestyle: "Lifestyle",
    other: "Other",
  };

  const categoryLabel = service?.category ? 
    (categoryLabels[service.category] || service.category) : 
    "Uncategorized";
  
  return (
    <>
      {/* Hero Section */}
      <section className="bg-white py-5 px-4 md:px-0">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="rounded-3xl bg-purple-100/70 shadow-xl border border-purple-200 px-8 py-12 max-w-6xl mx-auto"
        >
          <div className="flex flex-col md:flex-row items-center md:items-start gap-8">
            {/* Service Image */}
            <div className="w-full md:w-1/3 flex-shrink-0">
              {service?.image ? (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="rounded-2xl overflow-hidden shadow-lg border border-purple-200"
                >
                  <img
                    src={service.image}
                    alt={service.title}
                    className="w-full h-auto object-cover aspect-video"
                  />
                </motion.div>
              ) : (
                <motion.div
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: 0.2 }}
                  className="w-full rounded-2xl bg-purple-200/50 border border-purple-300 aspect-video flex items-center justify-center shadow-lg"
                >
                  <p className="text-purple-500 font-medium">No image available</p>
                </motion.div>
              )}
            </div>

            {/* Service Info */}
            <div className="w-full md:w-2/3 text-left">
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="px-3 py-1 bg-blue-200 text-white-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <Tag size={14} />
                  {categoryLabel}
                </span>
                
                {service?.pricing && (
                  <span className="px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm font-medium flex items-center gap-1">
                    <DollarSign size={14} />
                    {service.pricing}
                  </span>
                )}

                <span className="px-3 py-1 bg-orange-200 text-grey-700 rounded-full text-sm font-medium flex items-center gap-1">
                  <Calendar size={14} />
                  {formatDate(service?._createdAt || new Date().toISOString())}
                </span>
              </div>

              <h1 className="text-3xl md:text-4xl font-bold text-purple-900 mb-3">
                {service?.title || "Service Details"}
              </h1>
              
              <p className="text-lg text-grey-700 mb-6">
                {service?.shortDescription || "No description available"}
              </p>

              {service?.provider && (
                <Link
                  href={`/user/${service.provider?._id || "#"}`}
                  className="flex items-center gap-3 p-3 rounded-xl hover:bg-purple-200/50 transition-all mb-4 inline-block"
                >
                  {service.provider?.image ? (
                    <Image
                      src={service.provider.image}
                      alt={service.provider.name || "Service provider"}
                      width={48}
                      height={48}
                      className="rounded-full border-2 border-purple-300"
                    />
                  ) : (
                    <div className="w-12 h-12 rounded-full bg-purple-300 border-purple-700 flex items-center justify-center">
                      <User size={20} className="text-purple-700" />
                    </div>
                  )}

                  <div>
                    <p className="font-semibold text-purple-900">
                      {service.provider?.name || "Unknown Provider"}
                    </p>
                    <p className="text-sm text-purple-700">
                      @{service.provider?.username || "anonymous"}
                    </p>
                  </div>
                  <ChevronRight size={16} className="text-purple-500 ml-1" />
                </Link>
              )}
            </div>
          </div>
        </motion.div>
      </section>

      {/* Service Details Section */}
      <section className="bg-white py-3 px-4 md:px-10">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: 'easeOut' }}
          className="rounded-3xl bg-purple-100/70 shadow-xl border border-purple-200 px-6 py-10 max-w-6xl mx-auto"
        >
          <h2 className="text-2xl font-bold text-purple-900 mb-6 px-4">Service Details</h2>
          
          <div className="bg-white rounded-2xl p-6 shadow-sm border border-purple-200">
            {parsedContent ? (
              <article
                className="prose max-w-none font-work-sans"
                dangerouslySetInnerHTML={{ __html: parsedContent }}
              />
            ) : (
              <p className="text-center text-gray-500 py-12 text-lg">No details provided</p>
            )}
          </div>

          {/* Only include View component if id is provided */}
          {id && <View id={id} />}
        </motion.div>
      </section>

      {/* Related Services Section */}
      {relatedServices && relatedServices.length > 0 && (
        <section className="bg-purple-50 py-10 px-4 md:px-10 pb-16">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.4, ease: 'easeOut' }}
            className="rounded-3xl bg-purple-100/70 shadow-xl border border-purple-200 px-6 py-10 max-w-6xl mx-auto"
          >
            <h2 className="text-2xl font-bold text-purple-900 mb-6 text-center">Similar Services</h2>

            <ul className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {relatedServices.map((service, index) => (
                <motion.li
                  key={service._id || `related-${index}`}
                  initial={{ opacity: 0, y: 30 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: index * 0.05 + 0.5 }}
                  className="rounded-3xl overflow-hidden border border-purple-200 shadow-sm hover:shadow-lg transition-shadow duration-300"
                >
                  <ServiceCard post={service} />
                </motion.li>
              ))}
            </ul>
          </motion.div>
        </section>
      )}
    </>
  );
}