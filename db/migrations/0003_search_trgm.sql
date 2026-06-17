-- Enable trigram extension for fast ILIKE search on CJK + latin text
CREATE EXTENSION IF NOT EXISTS pg_trgm;

-- GIN indexes for search across entry titles, body, and film titles
CREATE INDEX IF NOT EXISTS entries_title_trgm ON entries USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS entries_body_md_trgm ON entries USING GIN (body_md gin_trgm_ops);
CREATE INDEX IF NOT EXISTS films_title_trgm ON films USING GIN (title gin_trgm_ops);
CREATE INDEX IF NOT EXISTS films_title_zh_trgm ON films USING GIN (title_zh gin_trgm_ops);
