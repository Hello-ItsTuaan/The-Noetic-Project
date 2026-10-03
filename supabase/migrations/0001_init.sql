-- Migration tham khảo cho Supabase.
-- Mỗi bảng có owner_id để ràng buộc dữ liệu theo người dùng.
-- Mục tiêu: khớp 1-1 với cấu trúc dữ liệu của app local.

CREATE EXTENSION IF NOT EXISTS "pgcrypto";

CREATE TABLE IF NOT EXISTS folders (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  name text NOT NULL,
  color text NOT NULL DEFAULT '#3b82f6',
  icon text NOT NULL DEFAULT '📚',
  owner_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS study_sets (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  folder_id uuid NOT NULL REFERENCES folders(id) ON DELETE CASCADE,
  name text NOT NULL,
  description text NOT NULL DEFAULT '',
  color text NOT NULL DEFAULT '#8b5cf6',
  icon text NOT NULL DEFAULT '📘',
  item_ids uuid[] NOT NULL DEFAULT '{}',
  owner_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id uuid NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  type text NOT NULL CHECK (type IN ('card','mcq','truefalse','match','fill','essay')),
  payload jsonb NOT NULL,
  "order" integer NOT NULL DEFAULT 0,
  owner_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id uuid NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  item_id uuid NOT NULL REFERENCES items(id) ON DELETE CASCADE,
  mastery numeric NOT NULL DEFAULT 0,
  last_reviewed_at timestamptz NULL,
  owner_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE TABLE IF NOT EXISTS attempts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  study_set_id uuid NOT NULL REFERENCES study_sets(id) ON DELETE CASCADE,
  score numeric NOT NULL DEFAULT 0,
  total numeric NOT NULL DEFAULT 0,
  correct_count integer NOT NULL DEFAULT 0,
  wrong_count integer NOT NULL DEFAULT 0,
  duration_seconds integer NOT NULL DEFAULT 0,
  mode text NOT NULL DEFAULT 'test',
  owner_id uuid NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  deleted_at timestamptz NULL
);

CREATE INDEX IF NOT EXISTS idx_folders_owner_id ON folders(owner_id);
CREATE INDEX IF NOT EXISTS idx_study_sets_folder_id ON study_sets(folder_id);
CREATE INDEX IF NOT EXISTS idx_study_sets_owner_id ON study_sets(owner_id);
CREATE INDEX IF NOT EXISTS idx_items_study_set_id ON items(study_set_id);
CREATE INDEX IF NOT EXISTS idx_progress_item_id ON progress(item_id);
CREATE INDEX IF NOT EXISTS idx_attempts_study_set_id ON attempts(study_set_id);

ALTER TABLE folders ENABLE ROW LEVEL SECURITY;
ALTER TABLE study_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE items ENABLE ROW LEVEL SECURITY;
ALTER TABLE progress ENABLE ROW LEVEL SECURITY;
ALTER TABLE attempts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Chỉ người dùng sở hữu mới xem/sửa dữ liệu của mình" ON folders
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Chỉ người dùng sở hữu mới xem/sửa dữ liệu của mình" ON study_sets
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Chỉ người dùng sở hữu mới xem/sửa dữ liệu của mình" ON items
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Chỉ người dùng sở hữu mới xem/sửa dữ liệu của mình" ON progress
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE POLICY "Chỉ người dùng sở hữu mới xem/sửa dữ liệu của mình" ON attempts
  FOR ALL
  USING (owner_id = auth.uid())
  WITH CHECK (owner_id = auth.uid());

CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trg_folders_updated_at
  BEFORE UPDATE ON folders
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_study_sets_updated_at
  BEFORE UPDATE ON study_sets
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_items_updated_at
  BEFORE UPDATE ON items
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_progress_updated_at
  BEFORE UPDATE ON progress
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER trg_attempts_updated_at
  BEFORE UPDATE ON attempts
  FOR EACH ROW
  EXECUTE FUNCTION update_updated_at_column();

-- Ghi chú cho tương lai:
-- 1. Chuyển dữ liệu từ local sang Supabase bằng exportSnapshot() rồi importSnapshot().
-- 2. Dùng auth.uid() để gán owner_id.
-- 3. Trước khi bật production, kiểm tra auth.users, RLS, và redirect URL cho domain thật.
