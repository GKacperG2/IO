/*
  # Dodanie obsługi notatek tekstowych i polityk dostępu

  1. Zmiany w tabeli notes
    - Dodanie kolumny content dla notatek tekstowych
    - Aktualizacja ograniczenia file_type
    - Dodanie polityk dostępu dla przedmiotów i prowadzących
  
  2. Polityki dostępu
    - Dodanie polityk dla subjects i professors
*/

-- Modyfikacja tabeli notes
ALTER TABLE notes 
ADD COLUMN content text DEFAULT NULL;

-- Aktualizacja ograniczenia file_type
ALTER TABLE notes 
DROP CONSTRAINT IF EXISTS notes_file_type_check;

ALTER TABLE notes 
ADD CONSTRAINT notes_file_type_check 
CHECK (file_type = ANY (ARRAY['pdf'::text, 'image'::text, 'text'::text]));

-- Modyfikacja kolumn file_path i file_type na opcjonalne
ALTER TABLE notes 
ALTER COLUMN file_path DROP NOT NULL,
ALTER COLUMN file_type DROP NOT NULL;

-- Dodanie walidacji że przynajmniej jedno pole musi być wypełnione
ALTER TABLE notes 
ADD CONSTRAINT notes_content_check 
CHECK ((content IS NOT NULL) OR (file_path IS NOT NULL));

-- Włączenie RLS dla subjects i professors
ALTER TABLE subjects ENABLE ROW LEVEL SECURITY;
ALTER TABLE professors ENABLE ROW LEVEL SECURITY;

-- Polityki dla subjects
CREATE POLICY "Anyone can view subjects"
ON subjects FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create subjects"
ON subjects FOR INSERT
TO authenticated
WITH CHECK (true);

-- Polityki dla professors
CREATE POLICY "Anyone can view professors"
ON professors FOR SELECT
TO public
USING (true);

CREATE POLICY "Authenticated users can create professors"
ON professors FOR INSERT
TO authenticated
WITH CHECK (true);