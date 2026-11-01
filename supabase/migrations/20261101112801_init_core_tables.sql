-- plans: workouts embedded as JSONB (matches the current domain model; always loaded together).
CREATE TABLE public.plans (
  id         uuid PRIMARY KEY,
  owner_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT '',
  color_idx  smallint NOT NULL DEFAULT 0,
  labels     text[] NOT NULL DEFAULT '{}',
  workouts   jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.plans ENABLE ROW LEVEL SECURITY;

CREATE POLICY "plans: owner select"
  ON public.plans FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "plans: owner insert"
  ON public.plans FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "plans: owner update"
  ON public.plans FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "plans: owner delete"
  ON public.plans FOR DELETE
  USING (auth.uid() = owner_id);

CREATE TRIGGER plans_updated_at
  BEFORE UPDATE ON public.plans
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- workouts: standalone workouts (exercises embedded as JSONB).
CREATE TABLE public.workouts (
  id         uuid PRIMARY KEY,
  owner_id   uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  name       text NOT NULL DEFAULT '',
  color_idx  smallint NOT NULL DEFAULT 0,
  labels     text[] NOT NULL DEFAULT '{}',
  exercises  jsonb NOT NULL DEFAULT '[]',
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "workouts: owner select"
  ON public.workouts FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "workouts: owner insert"
  ON public.workouts FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "workouts: owner update"
  ON public.workouts FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "workouts: owner delete"
  ON public.workouts FOR DELETE
  USING (auth.uid() = owner_id);

CREATE TRIGGER workouts_updated_at
  BEFORE UPDATE ON public.workouts
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();

-- exercise_images: per-user image catalog stored in Supabase Storage.
CREATE TABLE public.exercise_images (
  id           uuid PRIMARY KEY,
  owner_id     uuid NOT NULL REFERENCES public.profiles(id) ON DELETE CASCADE,
  file_name    text NOT NULL DEFAULT '',
  storage_key  text NOT NULL DEFAULT '',
  download_url text NOT NULL DEFAULT '',
  filter       text NOT NULL DEFAULT 'gym',
  created_at   timestamptz NOT NULL DEFAULT now(),
  updated_at   timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.exercise_images ENABLE ROW LEVEL SECURITY;

CREATE POLICY "exercise_images: owner select"
  ON public.exercise_images FOR SELECT
  USING (auth.uid() = owner_id);

CREATE POLICY "exercise_images: owner insert"
  ON public.exercise_images FOR INSERT
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "exercise_images: owner update"
  ON public.exercise_images FOR UPDATE
  USING (auth.uid() = owner_id)
  WITH CHECK (auth.uid() = owner_id);

CREATE POLICY "exercise_images: owner delete"
  ON public.exercise_images FOR DELETE
  USING (auth.uid() = owner_id);

CREATE TRIGGER exercise_images_updated_at
  BEFORE UPDATE ON public.exercise_images
  FOR EACH ROW EXECUTE FUNCTION public.set_updated_at();