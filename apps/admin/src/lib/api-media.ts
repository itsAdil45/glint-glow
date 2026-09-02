import { apiFetch } from "@/lib/api";

export interface MediaAsset {
  _id: string;
  url: string;
  thumbnailUrl?: string;
  filename?: string;
  alt?: string;
  width?: number;
  height?: number;
  bytes?: number;
  createdAt: string;
}

export interface MediaAssetsResponse {
  items: MediaAsset[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export async function fetchMediaAssets(
  params: { search?: string; page?: number; limit?: number } = {},
): Promise<MediaAssetsResponse> {
  const query = new URLSearchParams();
  if (params.search) query.set("search", params.search);
  if (params.page) query.set("page", String(params.page));
  if (params.limit) query.set("limit", String(params.limit));
  const qs = query.toString();
  return apiFetch<MediaAssetsResponse>(`/media${qs ? `?${qs}` : ""}`);
}
