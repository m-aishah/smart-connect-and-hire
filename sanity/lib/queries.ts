import { defineQuery } from "next-sanity";

export const SERVICES_QUERY = defineQuery(`*[_type == "service" &&
  (title match $search || shortDescription match $search || description match $search)]
  | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    "slug": slug.current,
    shortDescription,
    category,
    views,
    pricing,
    "image": image.asset->url,
    "provider": provider->{
      _id,
      name,
      "image": image.asset->url,
    }
  }`);


export const SERVICE_BY_ID_QUERY = defineQuery(`*[_type == "service" && _id == $id][0] {
  _id,
  _createdAt,
  title,
  shortDescription,
  description,
  category,
  pricing,
  "image": image.asset->url,
  "provider": provider->{
    _id,
    name,
    "image": image.asset->url,
    bio,
  }
}`);

export const SERVICES_BY_PROVIDER_QUERY = defineQuery(`*[_type == "service" && provider._ref == $providerId] 
  | order(_createdAt desc) {
    _id,
    _createdAt,
    title,
    shortDescription,
    category,
    pricing,
    "image": image.asset->url,
  }`);


export const STARTUPS_QUERY =
  defineQuery(`*[_type == "startup" && defined(slug.current) && 
  (!defined($search) || title match $search || category match $search || author->name match $search)] 
  | order(_createdAt desc) {
    _id, 
    title, 
    slug, 
    _createdAt,
    author->{
      _id,
      name,
      slug,
      image,
      bio
    }, 
    views,
    description, 
    category, 
    image, 
  }`);

export const STARTUP_BY_ID_QUERY =
  defineQuery(`*[_type == "startup" && _id == $id][0]{
  _id,
  title,
  slug,
  _createdAt,
  author->{
    _id,
    name,
    username,
    image,
    bio
  },
  views,
  description,
  category,
  image,
  pitch
}`);

export const AUTHOR_BY_ID_QUERY =
  defineQuery(`*[_type == "author" && _id == $id][0]{
  _id,
  id,
  name,
  username,
  email,
  image,
  bio
}`);

export const AUTHOR_BY_GITHUB_ID_QUERY =
  defineQuery(`*[_type == "author" && id == $id][0]{
  _id,
  id,
  name,
  username,
  email,
  image,
  bio
}`);

export const PLAYLIST_BY_SLUG_QUERY =
  defineQuery(`*[_type == "playlist" && slug.current == $slug][0]{
  _id,
  title,
  slug,
  select[]->{
    _id,
    _createdAt,
    title,
    slug,
    author->{
      _id,
      name,
      slug,
      image,
      bio
    },
    views,
    description,
    category,
    image,
    pitch
  }
}`);

export const STARTUPS_BY_AUTHOR_QUERY =
  defineQuery(`*[_type == "startup" && author._ref == $id] | order(_createdAt desc){
  _id, 
  title, 
  slug, 
  _createdAt,
  author->{
    _id,
    id,
    name,
    slug,
    image,
  }, 
  views,
  description, 
  category, 
  image, 
}`);

export const STARTUP_VIEWS_QUERY =
  defineQuery(`*[_type == "startup" && _id == $id][0]{
  _id,
  views
}`);

export const SERVICE_VIEWS_QUERY =
  defineQuery(`*[_type == "service" && _id == $id][0]{
  _id,
  views
}`);
