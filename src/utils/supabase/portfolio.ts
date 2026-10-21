
import { createClient } from "./client";

export type PortfolioItem = {
  id: string;
  section: string;
  title: string;
  slug: string | null;
  description: string | null;
  content: Record<string, unknown>;
  image_url: string | null;
  tags: string[];
  sort_order: number;
  is_published: boolean;
};

export async function getPortfolioItems(section?: string) {
  const supabase = createClient();

  let query = supabase
    .from("portfolio_items")
    .select(
      "id, section, title, slug, description, content, image_url, tags, sort_order, is_published"
    )
    .eq("is_published", true)
    .order("sort_order", { ascending: true });

  if (section) {
    query = query.eq("section", section);
  }

  const { data, error } = await query;

  if (error) {
    console.error("Unable to load portfolio content:", error.message);
    throw new Error("Could not load portfolio content.");
  }

  return data as PortfolioItem[];
}
